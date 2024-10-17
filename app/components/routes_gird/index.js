//React Imports
import React from 'react';

import { TenantDataGrid } from '../../components';

//Generates the "Linked Permissions" grid for settings tabs
const RoutesGrid = (params) => {
  const onRowsSelectionHandler = (id) => {
    const selectedRowsData = id.map((id) =>
      params.routes.find((row) => row.id === id)
    );
    params.updateFunc(selectedRowsData);
  };

  //Define the Columns that we want to draw out
  const routesColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100
    },
    {
      field: 'name',
      headerName: 'Name',
      editable: false,
      filterable: true,
      sortable: true,
      disableClickEventBubbling: true,
      flex: 2
    }
  ];

  return (
    <React.Fragment>
      <TenantDataGrid
        autoHeight
        rows={params.routes}
        columns={routesColumns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        loading={params.loading}
        NoRowsOverlay
        title={'Routes'}
        placeholder={'Routes'}
        checkboxSelection={true}
        rowSelectionModel={params?.selectionModel?.map((item) => item.id)}
        onRowSelectionModelChange={(id) => onRowsSelectionHandler(id)}
        initialState={{
          columns: {
            columnVisibilityModel: {
              id: false
            }
          }
        }}
      />
    </React.Fragment>
  );
};

export default RoutesGrid;
