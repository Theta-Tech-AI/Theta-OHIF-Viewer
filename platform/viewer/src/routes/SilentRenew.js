import React from 'react';
import { processSilentRenew } from 'redux-oidc';

const SilentRenewComponent = () => {
    processSilentRenew();
    return (
        <div></div>
    );
}

export default SilentRenewComponent;