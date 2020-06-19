package action;

import action.util.OutputUtil;
import bean.BookBean;
import bean.UserOrderBean;
import bean.jsonbean.PayingOrdersUploadBean;
import bean.jsonbean.ShoppingCartUploadBean;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.opensymphony.xwork2.ActionSupport;
import dao.impl.UserDaoImpl;
import hib.HibernateSessionFactory;
import org.apache.struts2.interceptor.SessionAware;
import org.hibernate.Session;

import java.io.IOException;
import java.util.*;

public class OrderAction extends ActionSupport implements SessionAware {
    Map<String, Object> session;
    private Integer id;
    private Integer amount;
    private String data;
    private int page;
    private int size;

    @Override
    public void setSession(Map<String, Object> session) {
        this.session = session;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    // 工具方法, 用于按ISBN查书;
    private BookBean getBookByISBN(String ISBN) {
        Session session = HibernateSessionFactory.getSession();
        BookBean bookBean = session.get(BookBean.class, ISBN);
        HibernateSessionFactory.closeSession(session);
        return bookBean;
    }

    // 工具方法, 根据订单, 获得相应的书籍信息;
    private List<BookBean> getBooksByOrders(List<UserOrderBean> orderList) throws IOException {
        List<BookBean> books = new ArrayList<>();
        // 页面需要使用书的信息, 查询并生成一个List;
        for(UserOrderBean tmp : orderList) {
            books.add(getBookByISBN(tmp.getISBN()));
        }
        return books;
    }

    // 获取购物车, 显示到页面上;
    public void fetchShoppingCart() throws IOException {
        Integer userId = (Integer) this.session.get("userId");
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        List<UserOrderBean> resultList = userDaoImpl.fetchShoppingCart(userId);
        Map<String, Object> map = new HashMap<>();
        map.put("err_code", 0);
        map.put("items", resultList);
        map.put("books", getBooksByOrders(resultList));
        OutputUtil.outputJson(map);
    }

    // 获取待付款的临时订单, 显示到页面上;
    public void fetchTempOrders() throws IOException {
        Integer userId = (Integer) this.session.get("userId");
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        List<UserOrderBean> resultList = userDaoImpl.fetchTempOrders(userId);
        Map<String, Object> map = new HashMap<>();
        map.put("err_code", 0);
        map.put("items", resultList);
        map.put("books", getBooksByOrders(resultList));
        OutputUtil.outputJson(map);
    }

    public void fetchPaidOrders() throws IOException {
        Integer userId = (Integer) this.session.get("userId");
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        List<UserOrderBean> resultList = userDaoImpl.fetchPaidOrders(userId, page, size);
        Map<String, Object> map = new HashMap<>();
        map.put("err_code", 0);
        map.put("items", resultList);
        map.put("books", getBooksByOrders(resultList));
        OutputUtil.outputJson(map);
    }

    // 工具方法, 用于更新各种订单;
    private void updateOrder(Integer id, UserOrderBean newBean) throws IOException {
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        boolean status = userDaoImpl.updateOrder(id, newBean);
        Map<String, Object> map = new HashMap<>();
        if(status) {
            map.put("err_code", 0);
        }
        else {
            map.put("err_code", 1);
            map.put("err_msg", "订单不存在, 或数据库连接问题!");
        }
        OutputUtil.outputJson(map);
    }

    // 改变购物车项目的数量;
    public void updateShoppingCartItemAmount() throws IOException {
        UserOrderBean bean = new UserOrderBean();
        bean.setAmount(amount);
        bean.setInCart(true);
        bean.setChecked(false);
        updateOrder(id, bean);
    }

    public void deleteOrderById() throws IOException {
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        boolean status = userDaoImpl.deleteOrderById(id);
        Map<String, Object> map = new HashMap<>();
        if(status) {
            map.put("err_code", 0);
        }
        else {
            map.put("err_code", 1);
            map.put("err_msg", "删除订单失败, 可能是数据库连接问题!");
        }
        OutputUtil.outputJson(map);
    }

    // 在购物车页面点击"去付款"按钮后, 被勾选的购物车项目将被更新到数据库;
    public void commitShoppingCartItem() throws IOException {
        // 反序列化;
        List<ShoppingCartUploadBean> uploadBeans = JSONArray.parseArray(data, ShoppingCartUploadBean.class);
        for(ShoppingCartUploadBean bean : uploadBeans) {
            UserOrderBean userOrderBean = new UserOrderBean();
            userOrderBean.setAmount(bean.getAmount());
            // 去付款的临时订单依旧在购物车里, 但处于锁定状态,
            // 即无法在购物车里查询到这个订单, 只有完成付款才会从中移除;
            userOrderBean.setInCart(true);
            userOrderBean.setChecked(true);
            updateOrder(bean.getId(), userOrderBean);
        }
    }

    // 在立即付款页面选择付款方式, 点击"确定"按钮后, 所有临时订单将被更新到数据库;
    public void commitTempOrders() throws IOException {
        // 反序列化;
        PayingOrdersUploadBean uploadBean = JSON.parseObject(data, PayingOrdersUploadBean.class);
        List<ShoppingCartUploadBean> list = uploadBean.getData();
        for(ShoppingCartUploadBean bean : list) {
            UserOrderBean userOrderBean = new UserOrderBean();
            userOrderBean.setAmount(bean.getAmount());
            // 订单锁定状态解除, 同时从购物车里移除;
            userOrderBean.setChecked(false);
            userOrderBean.setInCart(false);
            userOrderBean.setStatus("paid");
            userOrderBean.setPayMethod(uploadBean.getPayMethod());
            userOrderBean.setPayDate(new Date());
            updateOrder(bean.getId(), userOrderBean);
        }
    }
}
