package mozilla.org.webmaker.router.exception;

public class RouteNotFoundException extends RuntimeException {

    private static final long serialVersionUID = -2278644339983544651L;

    public RouteNotFoundException(String message) {
        super(message);
    }
}
