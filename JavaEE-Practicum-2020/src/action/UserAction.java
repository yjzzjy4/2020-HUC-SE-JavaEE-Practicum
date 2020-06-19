package action;

import action.util.EncryptPasswordUtil;
import action.util.OutputUtil;
import bean.UserBean;
import com.opensymphony.xwork2.ActionSupport;
import dao.impl.UserDaoImpl;
import org.apache.struts2.dispatcher.SessionMap;
import org.apache.struts2.interceptor.SessionAware;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class UserAction extends ActionSupport implements SessionAware {
    private Map<String, Object> session;
    private String username;
    private String password;
    private String phoneNumber;
    private String gender;

    @Override
    public void setSession(Map<String, Object> session) {
        this.session = session;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void validateUsername() throws IOException {
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        UserBean userBean = userDaoImpl.queryUserByName(username);
        Map<String, Object> map = new HashMap<>();
        if(userBean == null) {
            map.put("isAvailable", true);
        }
        else {
            map.put("isAvailable", false);
        }
        OutputUtil.outputJson(map);
    }

    public void register() throws IOException {
        UserBean userBean = new UserBean(username, EncryptPasswordUtil.encrypt(password), phoneNumber, gender);
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        boolean status = userDaoImpl.addUser(userBean);
        Map<String, Object> map = new HashMap<>();
        if(status) {
            map.put("err_code", 0);
        }
        else {
            map.put("err_code", 1);
            map.put("err_msg", "注册失败, 可能是数据库连接的问题!");
        }
        OutputUtil.outputJson(map);
    }

    public void login() throws IOException {
        UserDaoImpl userDaoImpl = new UserDaoImpl();
        UserBean userBean = userDaoImpl.queryUserByName(username);
        Map<String, Object> map = new HashMap<>();
        if(userBean == null) {
            map.put("err_code", 1);
            map.put("err_msg", "用户不存在或未登录");
        }
        else if(!userBean.getPassword().equals(EncryptPasswordUtil.encrypt(password))){
            map.put("err_code", 1);
            map.put("err_msg", "密码不正确");
        }
        else {
            map.put("err_code", 0);
            session.put("username", username);
            session.put("userId", userBean.getId());
        }
        OutputUtil.outputJson(map);
    }

    public void logout() {
        ((SessionMap<String, Object>) this.session).invalidate();
    }

    public void validateLoginStatus() throws IOException {
        Map<String, Object> map = new HashMap<>();
        if(session.get("username") == null) {
            map.put("err_code", 1);
            map.put("err_msg", "用户未登录");
        }
        else {
            map.put("err_code", 0);
        }
        OutputUtil.outputJson(map);
    }

    public void fetchUserInfo() throws IOException {
        String username = (String) session.get("username");
        Map<String, Object> map = new HashMap<>();
        UserBean userBean = new UserDaoImpl().queryUserByName(username);
        if(userBean == null) {
            map.put("err_code", 1);
            map.put("err_msg", "用户不存在或未登录");
        }
        else {
            // 防止在序列化过程中的延迟加载;
            userBean.setOrders(null);
            map.put("err_code", 0);
            map.put("user", userBean);
        }
        OutputUtil.outputJson(map);
    }
}
