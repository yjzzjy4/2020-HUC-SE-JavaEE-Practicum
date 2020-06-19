package action.util;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.util.TypeUtils;
import org.apache.struts2.ServletActionContext;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

// 工具类, 用response的PrintWriter做输出工作;
public class OutputUtil {
    // 输出Json;
    public static void outputJson(Map<String, Object> map) throws IOException {
        // 兼容原来的属性名格式, 而非强制将第一个字母小写;
        TypeUtils.compatibleWithFieldName = true;
        JSONObject data = new JSONObject(map);
        HttpServletResponse resp = ServletActionContext.getResponse();
        resp.setContentType("application/json;charset=utf-8");
        PrintWriter writer = resp.getWriter();
        writer.print(data);
        writer.flush();
        writer.close();
    }
}
