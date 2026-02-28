在 Java 里：

- **序列化（Serialization）**：把内存中的对象，转换成**可存储/可传输的字节序列**（通常是 `byte[]`），方便写入文件、缓存、消息队列、网络传输等。
- **反序列化（Deserialization）**：把这些字节序列再恢复成**Java 对象**。

------

## 为什么需要它

- **持久化**：把对象保存到磁盘，下次启动再恢复。
- **网络传输 / RPC**：把对象通过网络发给另一个进程/服务。
- **缓存/消息**：对象放进 Redis、MQ 等（通常会变成字节数组或字符串格式）。

------

## Java 原生序列化怎么做

### 1）让类实现 `Serializable`

```java
import java.io.Serializable;

public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private int age;
}
```

### 2）序列化：`ObjectOutputStream`

```java
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("user.bin"));
oos.writeObject(user);
oos.close();
```

### 3）反序列化：`ObjectInputStream`

```java
ObjectInputStream ois = new ObjectInputStream(new FileInputStream("user.bin"));
User user2 = (User) ois.readObject();
ois.close();
```

------

## 关键点与坑

1. **`serialVersionUID`**

- 用来标识类版本。类结构变了（字段增删改）可能导致反序列化失败（`InvalidClassException`）。
- 建议显式声明：`private static final long serialVersionUID = 1L;`

1. **`transient`**

- `transient` 修饰的字段**不会被序列化**（例如密码、临时缓存、线程等）。

  ```java
  private transient String password;
  ```

1. **不是所有对象都能序列化**

- 成员字段也必须可序列化；否则会 `NotSerializableException`。
- 常见不可序列化：`Thread`、`InputStream` 等。

1. **安全风险**

- 反序列化不可信数据可能引发安全问题（反序列化漏洞）。生产里通常避免 Java 原生序列化，或做白名单/过滤。

------

## 现实项目里更常见的替代方案

- **JSON**（Jackson/Gson）：可读性强、跨语言。
- **Protobuf / Thrift / Avro**：更高效、跨语言、协议明确。
- **Kryo**：高性能二进制（多用于 Java 内部）。



# serialVersionUID 

`private static final long serialVersionUID = 1L;` 的作用是：**给这个可序列化类一个“版本号”**，用来在**反序列化时做版本一致性校验**。

> [!TIP]
>
> 为什么要校验
>
> 因为反序列化需要按“类的结构”把字节流里的数据映射回字段。
>  如果类结构已经变化很大（比如字段类型改了、删了字段等），继续硬读可能会：
>
> - 读错数据、字段对不上
> - 得到语义错误的对象
> - 甚至引发更隐蔽的 bug
>
> 所以 Java 用 `serialVersionUID` 当作“我认不认这个版本的数据”的开关。
>
> 你能控制这件事吗
>
> 可以：
>
> - **显式写 `serialVersionUID`**：你就掌控“哪些版本能互相兼容”
> - **不写**：让 JVM 自动算，类一变 UID 就可能变，旧数据很容易读不了了
>
> 另外：就算 `serialVersionUID` 一致，**也不代表一定完全兼容**（比如字段含义变了但名字类型没变），它只是 Java 的“硬性门槛”。

当你把对象序列化成字节流时，字节流里会带上这个 `serialVersionUID`。以后反序列化时，JVM 会拿：

- 字节流里记录的 `serialVersionUID`
- 当前类文件里的 `serialVersionUID`

做对比——**不一致就直接报错**：

- `java.io.InvalidClassException: ... local class incompatible: stream classdesc serialVersionUID = X, local class serialVersionUID = Y`

------

## 为什么要显式写出来

如果你不写，Java 会根据**类的结构**（字段、方法、接口、修饰符等）自动计算一个 UID。

问题是：你只要稍微改了类（比如加个字段、改个字段类型、改了实现的接口等），自动计算出来的 UID 很可能就变了——
**以前序列化的数据就可能再也反序列化不了了。**

显式写成 `1L` 的好处是：

- 你改类时，UID 不会“莫名其妙”变化
- 只要你认为“仍然兼容旧数据”，就保持不变，旧数据还能读出来
- 如果你认为“这次改动不兼容旧数据”，你就手动改成 `2L`（或别的），让旧数据反序列化直接失败，避免读出错对象

------

## 什么时候需要改 serialVersionUID

- **兼容性改动（通常不改）**：比如新增一个字段（旧数据没有这个字段，反序列化后该字段用默认值）
- **不兼容改动（建议改）**：比如删除字段、修改字段类型/含义、改继承结构等（读旧数据可能产生语义错误）

------

## 一句话总结

`serialVersionUID` 就是“序列化数据与类定义的匹配凭证”，**控制反序列化能否接受旧版本对象数据**。