import React from 'react';

//Material UI DataGrid
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton
} from '@mui/x-data-grid';

import Stack from '@mui/material/Stack';

const TenantDataGrid = ({ title, tools = [], ...props }) => {
  return (
    <DataGrid
      components={{
        Toolbar: () => (
          <GridToolbarContainer>
            <GridToolbarColumnsButton id="columns-show-tool-btn" />
            <GridToolbarFilterButton
              id="filter-tool-btn"
              className="filter-tool"
            />
            {...tools}
          </GridToolbarContainer>
        ),
        NoRowsOverlay: () => (
          <Stack
            height="auto"
            paddingTop="40px"
            alignItems="center"
            justifyContent="center"
          >
            No {title}
          </Stack>
        ),
        NoResultsOverlay: () => (
          <Stack
            height="auto"
            paddingTop="40px"
            alignItems="center"
            justifyContent="center"
          >
            No {title} Found
          </Stack>
        )
      }}
      {...props}
      sx={{
        '& .MuiDataGrid-cell:focus': {
          outline: 'none'
        },
        '& .MuiDataGrid-cell:focus-within': {
          outline: 'none'
        },
        ...props.sx
      }}
    />
  );
};

export default TenantDataGrid;
