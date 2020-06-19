package action;

import action.util.OutputUtil;
import com.opensymphony.xwork2.ActionSupport;
import dao.impl.UserDaoImpl;
import org.apache.struts2.interceptor.SessionAware;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class PrepareOrderAction extends ActionSupport implements SessionAware {
    private Map<String, Object> session;
    private String ISBN;
    private int amount;
    private double unitPrice;
    private double totalPrice;

    @Override
    public void setSession(Map<String, Object> session) {
        this.session = session;
    }

    public String getISBN() {
        return ISBN;
    }

    public void setISBN(String ISBN) {
        this.ISBN = ISBN;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void addToShoppingCart() throws IOException {
        Integer userId = (Integer) this.session.get("userId");
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        boolean status = userDaoImpl.addToShoppingCart(userId, ISBN, amount, unitPrice);
        Map<String, Object> map = new HashMap<>();
        if(status) {
            map.put("err_code", 0);
        }
        else {
            map.put("err_code", 1);
            map.put("err_msg", "加入购物车失败, 可能是数据库连接问题!");
        }
        OutputUtil.outputJson(map);
    }

    // 实际上是立即购买的触发事件, 订单锁定状态应为checked == true;
    public void addToTempOrder() throws IOException {
        Integer userId = (Integer) this.session.get("userId");
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        boolean status = userDaoImpl.addToUserOrder(userId, ISBN, amount, unitPrice, false, true);
        Map<String, Object> map = new HashMap<>();
        if(status) {
            map.put("err_code", 0);
        }
        else {
            map.put("err_code", 1);
            map.put("err_msg", "加入订单失败, 可能是数据库连接问题!");
        }
        OutputUtil.outputJson(map);
    }
}
