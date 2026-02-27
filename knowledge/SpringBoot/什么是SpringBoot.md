# 回答

Spring Boot，说白了就是 Spring 的**脚手架**或者说是 Spring 的**懒人包**。

以前我们用 Spring 开发（SSM 时代），就像是**自己买零件组装电脑**： 你需要自己去找各种 jar 包，还要担心版本冲不冲突，然后写一大堆 XML 配置文件，最后还得自己装个 Tomcat 才能跑，非常繁琐，也就是大家常说的**配置地狱**。

而 Spring Boot 就像是**直接买一台品牌整机**（比如 MacBook）：

1. **起步依赖（Starters）**：它把常用的零件都打包好了（比如 web 开发套餐），你引入一个依赖，其他的它自动帮你配齐，而且版本都帮你管理好了，不会冲突。
2. **自动配置（Auto-Configuration）**：这是它的核心。它遵循**约定大于配置**，比如你引入了 MySQL 的包，它就猜到你要连数据库，自动帮你把连接池配好，除非你非要自己改。
3. **内嵌服务器**：它自带了 Tomcat，打成一个 Jar 包，一行 java -jar 命令就能跑，不用再单独部署 Web 服务器了。

所以，**Spring Boot 的本质就是：Spring + 自动化配置**，目的是让我们只关注业务代码，而不是把时间浪费在配置上。

![spring.drawio.png](./assets/%E4%BB%80%E4%B9%88%E6%98%AFSpringBoot/mLfhtykL_spring.drawio_mianshiya.webp)





# 扩展

`@SpringBootApplication` 是一个**组合注解**，等价于把下面三个注解一起加在启动类上：

1. `@SpringBootConfiguration`

- 本质上等同于 `@Configuration`（标记这是一个 Spring 配置类），并带有 Spring Boot 的语义。

1. `@EnableAutoConfiguration`

- 启用 Spring Boot 的**自动配置**机制（根据 classpath、配置文件、现有 Bean 等条件自动装配）。

1. `@ComponentScan`

- 启用**组件扫描**，默认从启动类所在包及其子包扫描 `@Component` / `@Service` / `@Repository` / `@Controller` 等。

如果你想“拆开写”，大致就是：

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
public class Application { ... }
```

（实际项目里通常直接用 `@SpringBootApplication` 就够了。）



![image-20260227102204144](./assets/%E4%BB%80%E4%B9%88%E6%98%AFSpringBoot/image-20260227102204144.png)