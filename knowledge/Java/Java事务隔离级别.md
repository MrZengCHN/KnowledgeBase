Java 里说“事务隔离级别”，本质是数据库隔离级别（JDBC/ORM 只是把它暴露出来）。常见 4 个级别（SQL 标准）+ 1 个“无事务”。

## 1) 4 个隔离级别与能防住的问题

先说并发下常见现象：

- **脏读（Dirty Read）**：读到别人**未提交**的数据
- **不可重复读（Non-repeatable Read）**：同一事务内两次读同一行，结果不同（别人提交了 update）
- **幻读（Phantom Read）**：同一事务内两次按条件查询，返回的行数/集合不同（别人提交了 insert/delete）

| 隔离级别                         | 是否允许脏读 | 是否允许不可重复读 | 是否允许幻读   | 典型说明                                                     |
| -------------------------------- | ------------ | ------------------ | -------------- | ------------------------------------------------------------ |
| **READ_UNCOMMITTED**（读未提交） | ✅ 可能       | ✅ 可能             | ✅ 可能         | 基本不推荐                                                   |
| **READ_COMMITTED**（读已提交）   | ❌ 不会       | ✅ 可能             | ✅ 可能         | 很多数据库默认（如 Oracle）                                  |
| **REPEATABLE_READ**（可重复读）  | ❌ 不会       | ❌ 通常不会         | ✅ 标准定义可能 | MySQL InnoDB 会用 MVCC + Next-Key Lock 在很多场景下也能防幻读 |
| **SERIALIZABLE**（串行化）       | ❌            | ❌                  | ❌              | 最强，代价最大（锁多/并发低）                                |

> 注意：**“能不能防幻读”**与数据库实现强相关。标准里 REPEATABLE_READ 仍可能幻读，但比如 InnoDB 通过间隙锁/Next-Key Lock 在“当前读/范围条件”场景会把幻读也压住；而某些数据库可能仍会出现。

## 2) 在 Java / JDBC 里怎么对应

JDBC 定义在 `java.sql.Connection`：

- `TRANSACTION_NONE`
- `TRANSACTION_READ_UNCOMMITTED`
- `TRANSACTION_READ_COMMITTED`
- `TRANSACTION_REPEATABLE_READ`
- `TRANSACTION_SERIALIZABLE`

常用代码：

```java
Connection conn = dataSource.getConnection();
conn.setAutoCommit(false);
conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);

try {
    // do sql...
    conn.commit();
} catch (Exception e) {
    conn.rollback();
    throw e;
}
```

### Spring 里（最常见）

Spring 的 `@Transactional` 可指定隔离级别：

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void doBiz() { ... }
```

如果不指定，通常是**跟随数据库默认隔离级别**（以及连接池/数据源配置）。

## 3) 怎么选（经验法则）

- **默认/通用业务**：`READ_COMMITTED`（脏读不可接受；性能与一致性折中好）
- **强一致读、同一事务内多次读取必须稳定**：`REPEATABLE_READ`
- **账务/库存极敏感、范围查询 + 严格防并发异常**：优先考虑
  1. 业务层加“正确的锁/版本号/幂等” 或
  2. 必要时用 `SERIALIZABLE`（但要评估吞吐/死锁/锁等待）

> 现实里很多“并发超卖/重复扣款”问题，**不是单靠隔离级别就能优雅解决**，通常还需要：乐观锁（version）、唯一约束、select … for update、幂等设计等。

## 4) 你如果告诉我你用的数据库/框架，我可以更精确

比如 MySQL(InnoDB)/PostgreSQL/Oracle，不同默认隔离级别、MVCC 行为、“幻读”定义（快照读 vs 当前读）都有差异。你现在的环境是哪个？（JDBC 直连 / Spring / MyBatis / JPA）