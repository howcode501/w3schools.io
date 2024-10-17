/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 8/26/2021
 */

import React from 'react';

//Material Core Imports

//Component Imports
import { connect } from 'react-redux';

function NonDashboardLayout(props) {
  return <div>{props.children}</div>;
}

export default connect((state) => state)(NonDashboardLayout);
