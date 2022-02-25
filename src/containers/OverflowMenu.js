/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import {connect} from 'react-redux';
import OverflowMenu from '../components/OverflowMenu';
import { cleanOverflowMenu,createOverflowMenu } from '../redux/modules/overflowmenu';
import { cleanContentMenu } from '../redux/modules/contentmenu';
import { deleteTableApi } from '../redux/modules/table';
const mapStateToProps = (state) =>{
    return {
        ...state.overflowmenu,
        ...state.table,
        ...state.setting
    }
}

const mapDispathToProps =(dispath)=>{
    return {
        cleanOverflowMenu:()=>{
            dispath(cleanOverflowMenu());
        },
        createOverflowMenu: (top,left, parameters)=>{
            dispath(createOverflowMenu(top,left, parameters))
        },
        cleanContentMenu:()=>{
            dispath(cleanContentMenu());
        },
        deleteTableApi:(tId)=>{
            dispath(deleteTableApi(tId));
        },
    }
}

export default connect(mapStateToProps,mapDispathToProps)(OverflowMenu);
