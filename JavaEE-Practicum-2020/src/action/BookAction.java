package action;

import action.util.OutputUtil;
import bean.BookBean;
import bean.BookTypeBean;
import com.opensymphony.xwork2.ActionSupport;
import dao.impl.BookDaoImpl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BookAction extends ActionSupport {
    private Integer typeId;
    private int rankNum;
    private String keyword;
    private int page;
    private int size;

    public Integer getTypeId() {
        return typeId;
    }

    public void setTypeId(Integer typeId) {
        this.typeId = typeId;
    }

    public int getRankNum() {
        return rankNum;
    }

    public void setRankNum(int rankNum) {
        this.rankNum = rankNum;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
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

    public void getBookTypes() throws IOException {
        BookDaoImpl bookDaoImpl = new BookDaoImpl();
        List<BookTypeBean> resultList = bookDaoImpl.queryAllTypes();
        Map<String, Object> map = new HashMap<>();
        map.put("err_code", 0);
        // 构造一个新的List, 舍弃查询结果的books属性,
        // 不然会触发延迟加载, 但Session已关闭, 会抛异常;
        List<BookTypeBean> newList = new ArrayList<>();
        for(BookTypeBean bookTypeBean : resultList) {
            newList.add(new BookTypeBean(bookTypeBean.getId(), bookTypeBean.getName()));
        }
        map.put("data", newList);
        OutputUtil.outputJson(map);
    }

    public void getRankListByTypeId() throws IOException {
        BookDaoImpl bookDaoImpl = new BookDaoImpl();
        List<BookBean> resultList = bookDaoImpl.queryBooksByRank(typeId, rankNum);
        Map<String, Object> map = new HashMap<>();
        if(resultList != null) {
            map.put("err_code", 0);
            map.put("data", resultList);
        }
        else {
            map.put("err_code", 1);
            map.put("err_msg", "查询的图书类别不存在!");
        }
        OutputUtil.outputJson(map);
    }

    public void getBooksByTypeId() throws IOException {
        BookDaoImpl bookDaoImpl = new BookDaoImpl();
        List<BookBean> resultList = bookDaoImpl.queryBooksByType(typeId, page, size);
        Map<String, Object> map = new HashMap<>();
        if(resultList != null) {
            map.put("err_code", 0);
            map.put("data", resultList);
        }
        else {
            map.put("err_code", 1);
            map.put("err_msg", "查询的图书类别不存在!");
        }
        OutputUtil.outputJson(map);
    }

    public void getBooksByKeyword() throws IOException {
        BookDaoImpl bookDaoImpl = new BookDaoImpl();
        List<BookBean> books = bookDaoImpl.queryBooksByKeyword(keyword, page, size);
        // 第一个对象的count属性表示记录集大小;
        if(!books.isEmpty()) {
            books.get(0).setCount(books.size());
        }
        Map<String, Object> map = new HashMap<>();
        map.put("err_code", 0);
        map.put("data", books);
        OutputUtil.outputJson(map);
    }
}
