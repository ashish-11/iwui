/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from 'redux-actions';


const initialState = {
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight - 44,
        zoom: 100,
        beginX: 100,
        beginY: 100,
        zIndex: 1,
        scaleBy: 1.04,
        scale:1,
        position:{x:0,y:0},
        isPin:false,
        leftbarShow: true,
        rightbarSize: window.innerWidth/3,
        isMidFullScreen: false,
        isRightFullScreen: false,
}

export const resetFullScreen = createAction('@@tf/setting/resetFullScreen');
export const setSetting = createAction('@@tf/setting/setSetting');
export const setScale = createAction('@@tf/setting/setScale');
export const setPosition = createAction('@@tf/setting/setPosition');
export const setPin = createAction('@@tf/setting/setPin');
export const changeleftbarShow= createAction('@@tf/setting/changeleftbarShow');
export const changeRightbarSize= createAction('@@tf/setting/changeRightbarSize');
export const setMidFullScreen= createAction('@@tf/setting/setMidFullScreen');
export const setExitMidFullScreen= createAction('@@tf/setting/setExitMidFullScreen');
export const setRightFullScreen= createAction('@@tf/setting/setRightFullScreen');
export const setExitRightFullScreen= createAction('@@tf/setting/setExitRightFullScreen');
export const settingReducer = handleActions(
    {
        [setSetting]:(state) => {
            return {
              ...state
            }
        },
        [setScale]:(state,{payload: scale}) => {
            return {
              ...state,
              scale:scale
            }
        },
        [setPosition]:(state,{payload: position}) => {
            return {
              ...state,
              position:position
            }
        },
        [setPin]:(state,{payload: value}) => {
            return {
              ...state,
              isPin:value
            }
        },
        [changeleftbarShow]:(state) => {
          return {
            ...state,
            leftbarShow:!state.leftbarShow
          }
        },
        [changeRightbarSize]:(state,{payload: rightbarSize}) => {
          return {
            ...state,
            rightbarSize: rightbarSize
          }
        },
        [setMidFullScreen]:(state) => {
          return {
            ...state,
            isMidFullScreen: true
          }
        },
        [setExitMidFullScreen]:(state) => {
          return {
            ...state,
            isMidFullScreen: false
          }
        },
        [setRightFullScreen]:(state) => {
          return {
            ...state,
            isRightFullScreen: true
          }
        },
        [setExitRightFullScreen]:(state) => {
          return {
            ...state,
            isRightFullScreen: false
          }
        },
        [resetFullScreen]:(state) => {
          return {
            ...state,
            isMidFullScreen: false,
            isRightFullScreen: false
          }
        }
    },
    initialState
)
        
export default settingReducer