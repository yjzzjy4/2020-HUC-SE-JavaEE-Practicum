package dao.impl;

import bean.UserBean;
import bean.UserOrderBean;
import dao.IUserDao;
import hib.HibernateSessionFactory;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;

import java.util.List;

public class UserDaoImpl implements IUserDao {
    @Override
    public boolean addUser(UserBean userBean) {
        Session session = HibernateSessionFactory.getSession();
        Transaction tx = null;
        boolean status = true;
        try {
            tx = session.beginTransaction();
            session.save(userBean);
            tx.commit();
        }
        catch(HibernateException e) {
            status = false;
            if(tx != null) {
                tx.rollback();
            }
            e.printStackTrace();
        }
        finally {
            HibernateSessionFactory.closeSession(session);
        }
        return status;
    }

    @Override
    // Leave it be...
    public void deleteUserByName(String username) {}

    @Override
    public UserBean queryUserByName(String username) {
        Session session = HibernateSessionFactory.getSession();
        List<UserBean> resultList = session.createQuery("from UserBean where username = :username", UserBean.class)
                                           .setParameter("username", username)
                                           .list();
        HibernateSessionFactory.closeSession(session);
        if(!resultList.isEmpty()) {
            return resultList.get(0);
        }
        return null;
    }

    @Override
    public void alterUserByName(String username, UserBean newBean) {
        Session session = HibernateSessionFactory.getSession();
        Transaction tx = null;
        try {
            tx = session.beginTransaction();
            UserBean userBean = queryUserByName(username);
            if(userBean != null) {
                if(newBean.getUsername() != null) {
                    userBean.setUsername(newBean.getUsername());
                }
                if(newBean.getPassword() != null) {
                    userBean.setPassword(newBean.getPassword());
                }
                if(newBean.getGender() != null) {
                    userBean.setGender(newBean.getGender());
                }
                if(newBean.getAvatar() != null) {
                    userBean.setAvatar(newBean.getAvatar());
                }
                if(newBean.getPhoneNumber() != null) {
                    userBean.setPhoneNumber(newBean.getPhoneNumber());
                }
                session.update(userBean);
                tx.commit();
            }
        }
        catch(HibernateException e) {
            if(tx != null) {
                tx.rollback();
            }
            e.printStackTrace();
        }
        finally {
            HibernateSessionFactory.closeSession(session);
        }
    }

    // 加入用户订单;
    public boolean addToUserOrder(Integer userId, String ISBN, int amount, double unitPrice, boolean inCart, boolean checked) {
        Session session = HibernateSessionFactory.getSession();
        Transaction tx = null;
        boolean status = true;
        try {
            tx = session.beginTransaction();
            UserOrderBean userOrderBean = new UserOrderBean();
            userOrderBean.setUserId(userId);
            userOrderBean.setISBN(ISBN);
            userOrderBean.setAmount(amount);
            userOrderBean.setUnitPrice(unitPrice);
            userOrderBean.setInCart(inCart);
            userOrderBean.setChecked(checked);
            session.save(userOrderBean);
            tx.commit();
        }
        catch(HibernateException e) {
            status = false;
            if(tx != null) {
                tx.rollback();
            }
            e.printStackTrace();
        }
        finally {
            HibernateSessionFactory.closeSession(session);
        }
        return status;
    }

    // 加入购物车, 对加入订单方法做一个包装;
    public boolean addToShoppingCart(Integer userId, String ISBN, int amount, double unitPrice) {
        Session session = HibernateSessionFactory.getSession();
        Transaction tx = null;
        boolean status = true;
        Query<UserOrderBean> query = session.createQuery(
                "from UserOrderBean where userId = :userId and ISBN = :ISBN and inCart = true and checked = false", UserOrderBean.class);
        query.setParameter("userId", userId).setParameter("ISBN", ISBN);
        List<UserOrderBean> resultList = query.list();
        // 用户购物车中没有和当前要加入商品ISBN匹配的, 无法合并;
        if(resultList.isEmpty()) {
            status = addToUserOrder(userId, ISBN, amount, unitPrice, true, false);
        }
        // 和原有的购物车项合并;
        else {
            UserOrderBean userOrderBean = resultList.get(0);
            try {
                tx = session.beginTransaction();
                userOrderBean.setAmount(userOrderBean.getAmount() + amount);
                session.update(userOrderBean);
                tx.commit();
            }
            catch(HibernateException e) {
                status = false;
                if(tx != null) {
                    tx.rollback();
                }
                e.printStackTrace();
            }
            finally {
                HibernateSessionFactory.closeSession(session);
            }
        }
        return status;
    }

    // 从数据库取出订单数据的工具方法;
    private List<UserOrderBean> fetchOrders(Integer userId, String HQL, int page, int size) {
        Session session = HibernateSessionFactory.getSession();
        Query<UserOrderBean> query = session.createQuery(HQL, UserOrderBean.class)
                                            .setParameter("userId", userId);
        List<UserOrderBean> resultList;
        // 不分页;
        if(page == 0) {
            resultList = query.list();
        }
        else {
            query.setFirstResult((page - 1) * size);
            query.setMaxResults(size);
            resultList = query.list();
        }
        HibernateSessionFactory.closeSession(session);
        return resultList;
    }

    // 从购物车取回数据, 显示到页面上;
    public List<UserOrderBean> fetchShoppingCart(Integer userId) {
        String HQL = "from UserOrderBean where userId = :userId and inCart = true and checked = false";
        // 对于购物车, 不进行分页;
        return fetchOrders(userId, HQL, 0, 0);
    }

    // 从数据库取出待支付的临时订单, 显示到页面上;
    public List<UserOrderBean> fetchTempOrders(Integer userId) {
        String HQL = "from UserOrderBean where userId = :userId and checked = true";
        // 对于临时订单, 不进行分页;
        return fetchOrders(userId, HQL, 0, 0);
    }

    // 从数据库取出已支付的订单, 显示到页面上;
    public List<UserOrderBean> fetchPaidOrders(Integer userId, int page, int size) {
        String HQL = "from UserOrderBean where userId = :userId and status = 'paid' order by payDate desc";
        // 对于已完成的订单, 进行分页;
        return fetchOrders(userId, HQL, page, size);
    }

    // 更新订单项;
    public boolean updateOrder(Integer id, UserOrderBean newOrder) {
        Session session = HibernateSessionFactory.getSession();
        Transaction tx = null;
        boolean status = true;
        try {
            UserOrderBean userOrderBean = session.get(UserOrderBean.class, id);
            // 订单存在;
            if(userOrderBean != null) {
                tx = session.beginTransaction();
                if(newOrder.getAmount() != null) {
                    userOrderBean.setAmount(newOrder.getAmount());
                }
                if(newOrder.isChecked() != userOrderBean.isChecked()) {
                    userOrderBean.setChecked(newOrder.isChecked());
                }
                if(newOrder.isInCart() != userOrderBean.isInCart()) {
                    userOrderBean.setInCart(newOrder.isInCart());
                }
                if(newOrder.getStatus() != null) {
                    userOrderBean.setStatus(newOrder.getStatus());
                }
                if(newOrder.getPayDate() != null) {
                    userOrderBean.setPayDate(newOrder.getPayDate());
                }
                if(newOrder.getPayMethod() != null) {
                    userOrderBean.setPayMethod(newOrder.getPayMethod());
                }
                session.update(userOrderBean);
                tx.commit();
            }
            else {
                status = false;
            }
        }
        catch(HibernateException e) {
            status = false;
            if(tx != null) {
                tx.rollback();
            }
            e.printStackTrace();
        }
        finally {
            HibernateSessionFactory.closeSession(session);
        }
        return status;
    }

    public boolean updateShoppingCartItem(Integer id, Integer amount, boolean checked) {
        Session session = HibernateSessionFactory.getSession();
        Transaction tx = null;
        boolean status = true;
        try {
            UserOrderBean userOrderBean = session.get(UserOrderBean.class, id);
            // 订单存在且处于购物车中;
            if(userOrderBean != null && userOrderBean.isInCart()) {
                tx = session.beginTransaction();
                // 可以不更新amount;
                if(amount != null) {
                    userOrderBean.setAmount(amount);
                }
                userOrderBean.setChecked(checked);
                session.update(userOrderBean);
                tx.commit();
            }
            else {
                status = false;
            }
        }
        catch(HibernateException e) {
            status = false;
            if(tx != null) {
                tx.rollback();
            }
            e.printStackTrace();
        }
        finally {
            HibernateSessionFactory.closeSession(session);
        }
        return status;
    }

    // 删除页面中购物车的项目, 并将状态写入数据库;
    public boolean deleteOrderById(Integer id) {
        Session session = HibernateSessionFactory.getSession();
        Transaction tx = null;
        boolean status = true;
        try {
            tx = session.beginTransaction();
            UserOrderBean userOrderBean = session.get(UserOrderBean.class, id);
            session.delete(userOrderBean);
            tx.commit();
        }
        catch(HibernateException e) {
            status = false;
            if(tx != null) {
                tx.rollback();
            }
            e.printStackTrace();
        }
        finally {
            HibernateSessionFactory.closeSession(session);
        }
        return status;
    }
}
