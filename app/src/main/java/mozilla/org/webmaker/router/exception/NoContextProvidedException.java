package mozilla.org.webmaker.router.exception;

public class NoContextProvidedException extends RuntimeException {

    private static final long serialVersionUID = -1381427067387547157L;

    public NoContextProvidedException(String message) {
        super(message);
    }
}
