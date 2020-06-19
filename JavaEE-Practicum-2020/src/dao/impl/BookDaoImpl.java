package dao.impl;

import bean.BookBean;
import bean.BookTypeBean;
import dao.IBookDao;
import hib.HibernateSessionFactory;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;

import java.util.List;

public class BookDaoImpl implements IBookDao {
    @Override
    public void addBook(BookBean bookBean) {
        Session session = HibernateSessionFactory.getSession();
        Transaction tx = null;
        try {
            tx = session.beginTransaction();
            session.save(bookBean);
            tx.commit();
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

    @Override
    // Leave it be...
    public void deleteBookByISBN(String ISBN) {}

    @Override
    public List<BookTypeBean> queryAllTypes() {
        Session session = HibernateSessionFactory.getSession();
        List<BookTypeBean> resultList = session.createQuery("from BookTypeBean", BookTypeBean.class).list();
        HibernateSessionFactory.closeSession(session);
        return resultList;
    }

    @Override
    public BookBean queryBookByISBN(String ISBN) {
        Session session = HibernateSessionFactory.getSession();
        BookBean bookBean = session.get(BookBean.class, ISBN);
        HibernateSessionFactory.closeSession(session);
        return bookBean;
    }

    @Override
    // 获取某个类别中销量最高的top本书;
    public List<BookBean> queryBooksByRank(Integer typeId, int top) {
        Session session = HibernateSessionFactory.getSession();
        // 类别不存在;
        BookTypeBean bookType = session.get(BookTypeBean.class, typeId);
        if(bookType == null) {
            HibernateSessionFactory.closeSession(session);
            return null;
        }
        Query<BookBean> query = session.createQuery("from BookBean where typeId = :typeId order by sales", BookBean.class);
        query.setParameter("typeId", typeId);
        query.setMaxResults(top);
        List<BookBean> resultList = query.list();
        HibernateSessionFactory.closeSession(session);
        return resultList;
    }

    @Override
    public List<BookBean> queryBooksByType(Integer typeId, int page, int size) {
        Session session = HibernateSessionFactory.getSession();
        // 类别不存在;
        BookTypeBean bookType = session.get(BookTypeBean.class, typeId);
        if(bookType == null) {
            HibernateSessionFactory.closeSession(session);
            return null;
        }
        Query<BookBean> query = session.createQuery("from BookBean where typeId = :typeId", BookBean.class);
        query.setParameter("typeId", typeId);
        // 分页查询;
        query.setFirstResult((page - 1) * size);
        query.setMaxResults(size);
        List<BookBean> resultList = query.list();
        HibernateSessionFactory.closeSession(session);
        return resultList;
    }

    @Override
    public List<BookBean> queryBooksByKeyword(String keyword, int page, int size) {
        System.out.println(keyword + " " + page + " " + size);
        Session session = HibernateSessionFactory.getSession();
        Query<BookBean> query = session.createQuery(
                "from BookBean where title like :keyword or author like :keyword or brief like :keyword", BookBean.class);
        query.setParameter("keyword", "%"+keyword+"%");
        // 分页查询;
        query.setFirstResult((page - 1) * size);
        query.setMaxResults(size);
        List<BookBean> resultList = query.list();
        HibernateSessionFactory.closeSession(session);
        return resultList;
    }

    @Override
    // Leave it be...
    public void alterBookByISBN(String ISBN) {}
}