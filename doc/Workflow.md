#### Flow ####

In order to access new or existing components from the browser, following steps needs to be followed

1. Create a component in src/components which needs to be accessed, check that the component is being exported properly which in src/components/<ComponentName>/index.js
    
    import Dashboard from "./Dashboard"
    export default Dashboard;

2. In order to acces state and props for the components, Add the <filename>.js file in src/containers folder which will pass state and props to the compnents. This also should be properly exported.

3. Route needs to be defined in src/index.js where a new entry has to be made as the example given below

    import TablePage from './containers/TablePage';
    <HashRouter>
        <Switch>
            <Route exact path="/" component={App} />
            <Route exact path="/dashboard" component={App} />
            <Route path="/tablepage/:id" component={TablePage} />
        </Switch>
    </HashRouter>

    This entry can either be of src/containes/*.js or src/components/*.js and similarly, the component has to be properly exported from containers or components and imported in src/index.js  
 
