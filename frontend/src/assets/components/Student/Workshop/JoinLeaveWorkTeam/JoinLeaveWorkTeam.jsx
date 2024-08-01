import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import WorkShopSelector from './WorkShopSelector';

const JoinLeaveWorkteam = () => {
    const userId = useSelector((state) => state.user.user.id);
    const [token] = useState(localStorage.getItem('token'));
    return (
        <WorkShopSelector studentId={userId} token={token} />
    )
}

export default JoinLeaveWorkteam