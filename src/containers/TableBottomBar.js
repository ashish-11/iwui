/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import {connect} from 'react-redux';
import TableBottomBar from '../components/TableBottomBar';
import { setScale,setPosition,setPin} from '../redux/modules/setting';

const mapStateToProps = (state) =>{
    return {
        ...state.setting,
        ...state.table,
        ...state.image,
    }
}

const mapDispathToProps =(dispath)=>{
    return {
        setScale:(data)=>{
            dispath(setScale(data))
        },
        setPosition:(data)=>{
            dispath(setPosition(data))
        },
        setPin:(value)=>{
            dispath(setPin(value))
        },

    }
}

export default connect(mapStateToProps,mapDispathToProps)(TableBottomBar);