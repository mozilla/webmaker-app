## Router

Routers helpful switch between activities. You can map routes, and assign them classes (Activities).

Inside the Activity classes, you can add support for URL parameters that might be passed along with the class.

These can be put in a Bundle, and then parsed into objects, for manipulation, etc. 

### Getting started

Preferably in a your main Application class, (provided one exists) it is recommended to register your app's router
and URLs in the onCreate() method, or sub-method registered within onCreate(). Creating a new instance of the router
is simple and easy, here is how you can create a instance.

```java
Context context = getApplicationContext();
Router userRouter = new Router(context);
```

You have just created a new instance of the router, and assigned it the parent context of your app's main application
class! However this instance, isn't shared and therefore you are unable to open URLs from other classes.

Here is another way for achieving the same thing, and accessing URLs via multiple classes.

```java
Context context = getApplicationContext();
Router.sharedRouter().setContext(context);
```

An exception will be thrown, if you do not provide context, and attempt to manipulate the router.

Now we can start mapping URLs, and assigning activity classes to them! Here is a quick example of how to do that.

```java
router.map("/main", MainActivity.class);
```

And if your using the shared version of this as well:

```java
Router.sharedRouter().map("/main", MainActivity.class);
```

The above code snippet, doesn't require any parameters and assigns the '/main' URL to MainActivity.class! 

Lets see what the same thing would look like, with some parameters.

```java
router.map("/main/:page", MainActivity.class);
```

And if your using the shared version of this as well:

```java
Router.sharedRouter().map("/main/:page", MainActivity.class);
```

Here is the same code as above, with a new parameter called page! This parameter will be passed on to
the MainActivity class, when it is triggered, along with its value. The value can then be parsed and manipulated.

### Intents

When you pass a URL, on to a class as shown above (MainActivity.class), you will probably want to parse these arguments.

Here is a extremely easy, and simple way to do this!

```java
Bundle intentExtras = getIntent().getExtras();
String page = intentExtras.get("page");
```

The above post, gets all of the intents passed through to the class, and looks for one called "page". Intents are marked
by having a ':' right before the word (no spaces). The parser will define what is a arg, and what isn't by the '/'.

### Launching Activities

So now you've learned how to map your URLs, set up the router, and parse args that may be passed along to your activity.

The only thing left to do, is figure out how to launch these activities! This code snippet assumes you have already registered
your routes and setup your Router, as well as configured your activity to accept these arguments. Lets get started!

```java
router.open("main/1");
```

And if your using the shared version of this as well:

```java
Router.sharedRouter().open("main/1");
```

The above code will run the route "/main/:page", and pass the page arg (1), to the MainActivity class where it was assigned.

You can make routes, as complex as you want, or as simple as you want!

### External URLs

You can also use the Router, to launch external URLs!

```java
router.openExternal("http://www.youtube.com/watch?v=oHg5SJYRHA0");
```

And if your using the shared version of this as well:

```java
Router.sharedRouter().openExternal("http://www.youtube.com/watch?v=oHg5SJYRHA0");
```

### Multiple Routers

If you wish to use the OOP version of this Router, you can create multiple routers for different groups of users.

For instance, having a Admin and User router!

```java
Router adminRouter = new Router();
Router userRouter = new Router();
```

### Routable Functions

You can call arbitrary blocks of code with Routable as well!

```java
router.map("logout", new Router.RouterCallback() {
    public void run(Map<String, String> extras) {
        User.logout();
    }
});

router.open("logout");
```

And if your using the shared version of this as well:

```java
Router.sharedRouter().map("logout", new Router.RouterCallback() {
    public void run(Map<String, String> extras) {
        User.logout();
    }
});

Router.sharedRouter().open("logout");
```