package bean.jsonbean;

import java.util.List;

public class PayingOrdersUploadBean {
    private List<ShoppingCartUploadBean> data;
    private String payMethod;

    public PayingOrdersUploadBean() {}

    public List<ShoppingCartUploadBean> getData() {
        return data;
    }

    public void setData(List<ShoppingCartUploadBean> data) {
        this.data = data;
    }

    public String getPayMethod() {
        return payMethod;
    }

    public void setPayMethod(String payMethod) {
        this.payMethod = payMethod;
    }
}
