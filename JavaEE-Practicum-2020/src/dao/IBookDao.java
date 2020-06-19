package dao;

import bean.BookBean;
import bean.BookTypeBean;

import java.util.List;
import java.util.Set;

public interface IBookDao {
    void addBook(BookBean bookBean);
    void deleteBookByISBN(String ISBN);
    List<BookTypeBean> queryAllTypes();
    BookBean queryBookByISBN(String ISBN);
    List<BookBean> queryBooksByRank(Integer typeId, int top);
    List<BookBean> queryBooksByType(Integer typeId, int page, int size);
    List<BookBean> queryBooksByKeyword(String keyword, int page, int size);
    void alterBookByISBN(String ISBN);
}
