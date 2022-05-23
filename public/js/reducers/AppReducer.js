const AppConstants = require('../constants/AppConstants');
const COLOR_NONE = 255; // LED off

const isInIFrame = () =>  (typeof window !== 'undefined') &&
          (window.location !== window.parent.location);

const AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {isConnected: false, isClosed: false,
                 ledOn: COLOR_NONE, displayDisconnect: false,
                 inIFrame: isInIFrame(),
                 displayURL: false,
                 error: null};
    } else {
        switch(action.type) {
        case AppConstants.APP_UPDATE:
        case AppConstants.APP_NOTIFICATION:
            return Object.assign({}, state, action.state);
        case AppConstants.APP_ERROR:
            return Object.assign({}, state, {error: action.error});
        case AppConstants.WS_STATUS:
            return Object.assign({}, state, {isClosed: action.isClosed});
        default:
            return state;
        }
    };
};

module.exports = AppReducer;
