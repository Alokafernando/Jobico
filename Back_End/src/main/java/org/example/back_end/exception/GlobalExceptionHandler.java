package org.example.back_end.exception;

import io.jsonwebtoken.ExpiredJwtException;
import org.example.back_end.dto.ApiResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Exception Handler for UsernameNotFoundException
    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponseDTO handleUserNameNotFoundException(UsernameNotFoundException ex) {
        return new ApiResponseDTO(404, "User not found", null);
    }

    // Exception Handler for BadCredentialsException
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponseDTO handleBadCredentials(BadCredentialsException ex) {
        return new ApiResponseDTO(400, "Bad Credentials", null);
    }

    // Exception Handler for JWT Token Expired Exception
    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponseDTO handleJWTTokenExpiredException(ExpiredJwtException ex) {
        return new ApiResponseDTO(401, "JWT Token Expired", null);
    }

    // Exception Handler for all other exceptions
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponseDTO handleAllExceptions(RuntimeException ex) {
        ex.printStackTrace(); // Log full stack trace to console
        return new ApiResponseDTO(500, ex.getMessage(), null);
    }
}
