# Displaying Apps

Since each app is just a collection of blocks, all that is needed to display an app is the following:

```html
<ul class="blocks">
    <li v-component="{{type}}" v-repeat="app.blocks"></li>
</ul>
```

Adding the `editable` class to each `li` makes the dotted outline appear (as in editing mode).
