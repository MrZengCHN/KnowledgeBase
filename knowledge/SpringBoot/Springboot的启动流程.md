**结论与推荐（启动流程主线）**

1. Spring Boot 启动的核心入口是 `SpringApplication.run()`：先准备环境与上下文，再加载 Bean，最后刷新容器并启动内嵌服务器。
2. 启动链路里最关键的三个阶段：**Environment 准备**（读配置/建 Profile）、**ApplicationContext 准备并刷新**（BeanDefinition -> Bean 实例化/依赖注入）、**afterRefresh**（Web 容器/Runner 执行/就绪事件）。
3. 自动装配的本质是：通过 `@SpringBootApplication` 触发配置类解析 + `EnableAutoConfiguration` 导入一堆候选配置，按条件（`@ConditionalOn...`）决定是否生效。
4. 实践上推荐：把“启动期自定义”放在正确扩展点（`EnvironmentPostProcessor` / `ApplicationContextInitializer` / `BeanFactoryPostProcessor` / `ApplicationRunner`），避免在静态块或 `@PostConstruct` 做重活。

**原理与关键机制（按时间顺序拆解）**

1. **new SpringApplication(...) 初始化阶段**

   - 推断应用类型（SERVLET/REACTIVE/NONE）、初始化 `ApplicationContext` 类型、加载 `SpringApplicationRunListener`、收集 primary sources。

   - 读取 `spring.factories`/`META-INF/spring/...`（不同版本机制略有差异）来发现：监听器、初始化器、自动配置等扩展点。

2. **run() 开始：准备环境 Environment**

   - 创建并配置 `Environment`：加载命令行参数、系统属性、`application.yml/properties`、Profile 等；处理配置优先级（命令行通常最高）。

   - 发布早期事件（如 environment prepared），允许你通过 `EnvironmentPostProcessor` / Listener 在容器刷新前修改属性源。

   - 常见坑：配置加载顺序误判导致“为什么我的配置不生效”；解决思路是明确 PropertySource 优先级，并用 Actuator `env` 端点或启动日志验证。

3. **创建 ApplicationContext + 准备上下文（prepareContext）**

   - 实例化 `ApplicationContext`（Servlet Web 通常是 `AnnotationConfigServletWebServerApplicationContext`），注册 `BeanNameGenerator` 等。

   - 调用 `ApplicationContextInitializer#initialize`：这是“上下文刷新前”的最早定制点之一。

   - 将 primary sources（带 `@SpringBootApplication` 的启动类等）注册为配置源。

4. **refresh()：真正的 Spring 容器启动（最重的阶段）**

   - `invokeBeanFactoryPostProcessors`：解析 `@Configuration`、`@ComponentScan`、`@Import`，把大量 `BeanDefinition` 放进容器；此时 **自动装配** 也在这里参与：
     - `@EnableAutoConfiguration` -> `AutoConfigurationImportSelector` 导入候选自动配置类；
     - 每个自动配置类通过 `@ConditionalOnClass/@ConditionalOnMissingBean/@ConditionalOnProperty...` 决定是否创建 Bean。

   - `registerBeanPostProcessors`：注册 AOP、`@Autowired`、`@Transactional` 等依赖的后置处理器。

   - `finishBeanFactoryInitialization`：单例 Bean 大规模实例化、属性注入、`@PostConstruct`、初始化回调；AOP 代理通常在这里生成。

   - 并发语义点：默认单例创建在容器刷新线程串行进行；若引入懒加载/并行初始化（某些定制）会改变启动时延但要小心循环依赖和线程安全。

5. **Web 场景：启动内嵌服务器 + 发布就绪事件**

   - `ServletWebServerApplicationContext` 在 `onRefresh()` 创建 `WebServer`（Tomcat/Jetty/Undertow），绑定端口、注册 DispatcherServlet、Filter、ServletContextInitializer 等。

   - `ApplicationRunner/CommandLineRunner` 在容器刷新后执行（适合做“依赖 Bean 已就绪”的启动任务）。

   - 发布 `ApplicationStartedEvent / ApplicationReadyEvent`：`Ready` 表示容器可对外服务（但你仍需配合健康检查/预热策略）。

6. **常见边界与坑**

   - **循环依赖**：启动阶段暴露得最明显；尽量通过重构依赖方向、引入 `@Lazy`（谨慎）或拆分配置解决。

   - **条件装配冲突**：自定义 Bean 覆盖自动配置时，注意 `@ConditionalOnMissingBean` 的生效条件与 Bean 名称/类型匹配。

   - **启动慢**：通常是类路径扫描过大、反射/代理过多、远程配置/连接初始化阻塞；可以用 `--debug`、`spring.main.lazy-initialization=true`（权衡）、以及启动火焰图/日志定位。



![Springboot的启动流程](./assets/Springboot%E7%9A%84%E5%90%AF%E5%8A%A8%E6%B5%81%E7%A8%8B/Springboot%E7%9A%84%E5%90%AF%E5%8A%A8%E6%B5%81%E7%A8%8B.svg)

