package action;

import action.util.OutputUtil;
import com.opensymphony.xwork2.ActionSupport;
import org.apache.struts2.ServletActionContext;
import org.apache.struts2.interceptor.SessionAware;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletResponse;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class CaptchaAction extends ActionSupport implements SessionAware {
    private Map<String, Object> session;

    @Override
    public void setSession(Map<String, Object> session) {
        this.session = session;
    }

    public void generateCaptcha() throws Exception {
        HttpServletResponse resp = ServletActionContext.getResponse();
        resp.setContentType("image/png");
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        // 生成大写字母、小写字母和数字组成的六位验证码;
        for(int i = 0; i < 6; i++) {
            char ch = '\0';
            switch(rnd.nextInt(3)) {
                case 0: {
                    ch = (char)(rnd.nextInt(26) + 65);
                    break;
                }
                case 1: {
                    ch = (char)(rnd.nextInt(26) + 97);
                    break;
                }
                case 2: {
                    ch = (char)(rnd.nextInt(10) + 48);
                    break;
                }
            }
            sb.append(ch);
        }
        OutputStream os = resp.getOutputStream();
        BufferedImage image = new BufferedImage(120, 30, BufferedImage.TYPE_4BYTE_ABGR);
        Graphics g = image.getGraphics();
        int R = rnd.nextInt(255);
        int G = rnd.nextInt(255);
        int B = rnd.nextInt(255);
        g.setColor(new Color(R, G, B));
        g.setFont(new Font(Font.MONOSPACED, Font.ITALIC, 28));
        g.drawString(sb.toString(), 10, 25);
        // 生成二维码随机干扰线;
        int x1, y1, x2, y2;
        for(int i = 0; i < 18; i++) {
            R = rnd.nextInt(255);
            G = rnd.nextInt(255);
            B = rnd.nextInt(255);
            x1 = rnd.nextInt(120);
            x2 = rnd.nextInt(120);
            y1 = rnd.nextInt(30);
            y2 = rnd.nextInt(30);
            g.setColor(new Color(R, G, B));
            g.drawLine(x1, y1, x2, y2);
        }
        // 验证码存一份到Session, 再把图写到resp的输出流;
        session.put("captcha", sb.toString());
        ImageIO.write(image, "png", os);
        os.flush();
        os.close();
    }

    public void getCaptcha() throws Exception {
        String captcha = (String)this.session.get("captcha");
        Map<String, Object> map = new HashMap<>();
        if(captcha == null) {
            map.put("err_code", 1);
            map.put("err_msg", "验证码获取失败, 可能是Session已失效!");
        }
        else {
            map.put("err_code", 0);
        }
        map.put("captcha", captcha);
        OutputUtil.outputJson(map);
    }
}
