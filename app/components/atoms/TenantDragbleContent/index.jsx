import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const TenantDragbleContent = ({
  onDragEnd,
  getItemStyle,
  getListStyle,
  displayOrder,
}) => {
  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => {
            return (
              <>
                <div
                  ref={provided.innerRef}
                  style={getListStyle(
                    snapshot.isDraggingOver,
                    displayOrder.length
                  )}
                  {...provided.droppableProps}
                >
                  {displayOrder
                    ? displayOrder.map((item, index) => {
                        return (
                          <Draggable
                            key={item.id}
                            draggableId={String(item.id)}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}
                                >
                                  {item.product_name}
                                </div>
                              );
                            }}
                          </Draggable>
                        );
                      })
                    : null}
                </div>
              </>
            );
          }}
        </Droppable>
      </DragDropContext>
    </>
  );
};
export default TenantDragbleContent;
