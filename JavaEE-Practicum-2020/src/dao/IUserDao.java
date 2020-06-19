package dao;

import bean.UserBean;

public interface IUserDao {
    boolean addUser(UserBean userBean);
    void deleteUserByName(String username);
    UserBean queryUserByName(String username);
    void alterUserByName(String username, UserBean newBean);
}
