package org.example.back_end.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/logos/**")
                .addResourceLocations("file:uploads/logos/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // allow CORS for all endpoints
                .allowedOrigins("http://localhost:63342") // your frontend origin
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // allowed methods
                .allowCredentials(true); // allow sending cookies/authorization headers
    }
}
