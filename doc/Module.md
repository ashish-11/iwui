# Main Modules

src directory contains the following important modules :-
1. components
    This directory contains all the views which gets rendered in UI. Each component has the index.js file which exports the given components to other components and container. Anothe one is style.scss file which contains the styles for that component. This style file will either be imported in the component.js file itself or in src/index.js file if the styles has to be used in other compnents as well.

2. containers
    This directory contains all the containers which maps redux state and props to the given components in order to access the state for all the components inside the component folder. The js file in container passes the state as a prop to the components. Mapping of state and props are as follows:-

    class LandingPageContainer extends Component {
        render() {
            return (
                
            );
        }
    }
    const mapStateToProps = (state) => {
        return {
            messages: state.message.messages,
        };
    };
    const mapDispatchToProps = (dispatch) => {
        return {
            onCreateMessage: (kind,message) => {
                dispatch(createMessage(kind,message));
            },
        };
    };
    export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(LandingPageContainer);

3. redux
    The module inside this directory contains all the js files which is actually being used for managing and centralizing application state using redux.
    The each js files in module act as a reducer which is a function that accepts an action and previous state and the returns a new state. 
    For example: table.js file has an implementation for all the actions related to table. The implementaion of any action is followed by the triggered action and updates the state. The API calls is managed in these actions which is as follows:-

    export const finishTableEdit = createAction('@@tf/table/finishTableEdit',
    (tableId) => (dispatch, getState) => {
        let tables = getState().table.tableStore;
        if (tableId === 'All') {
            _.forEach(tables, t => {
                t.tableEditFlag = false;
            })
        } else {
            let table = _.filter(tables, t => t.id === tableId)
            if (!!table && table.length > 0) {
                table[0].tableEditFlag = false;
            }
        }
        return tables;
    });

    and its handledAction 
    [finishTableEdit]: (state, { payload: data }) => {
        return {
            ...state,
            tableEditFlag: false,
            tableStore: data
        }
    },

4. assets
    This contains the static files such as icon/other images which are accessed and used in the components