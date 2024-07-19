package projectspk.procieAHP.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/** Defines a controller to handle HTTP requests */
@Controller
public final class HelloWorldController {

  private static String project;
  private static final Logger logger = LoggerFactory.getLogger(HelloWorldController.class);

  /**
   * Create an endpoint for the landing page
   *
   * @return the index view template
   */
  @GetMapping("/")
  public String helloWorld(Model model) {

    return "index";
  }
  @GetMapping("/cpu")
  public String cpu(Model model){
    return "cpu";
  }

}
