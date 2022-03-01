#### For adding new component

1. Create a compnent in src/component directory
2. Create a container which will pass state and props to the component
3. If backend API has to be invoked then Theses API calls should be made in redux/module/<filename>.js file where an existing/new action need to be used and call backend API in its implementation and update the state.