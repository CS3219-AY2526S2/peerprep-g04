import React from "react";

export function Table({
  children,
  style = {},
  className = "",
  emptyMessage = "No data available",
  minWidth = "100%",
}) {
  const baseStyle = {
    background: "white",
    boxSizing: "border-box",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "1.25rem",
    boxShadow:
      "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
    overflowX: "auto",
  };

  const tableStyle = {
    width: "100%",
    minWidth: minWidth,
    borderCollapse: "collapse",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    border: "none",
  };

  const thStyle = {
    textAlign: "center",
    padding: "0.75rem",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
  };

  const tdStyle = (cellProps) => ({
    textAlign: "center",
    padding: "0.75rem",
    borderBottom: "1px solid #f1f5f9",
    color: cellProps?.style?.color || "#0f172a",
  });

  let isEmpty = false;

  const styledChildren = React.Children.map(children, (child) => {
    if (child.type === "table") {
      return React.cloneElement(child, {
        style: tableStyle,
        children: React.Children.map(child.props.children, (section) => {
          if (section.type === "tbody") {
            const rows = React.Children.toArray(section.props.children);
            isEmpty = rows.length === 0;

            return React.cloneElement(section, {
              children: isEmpty ? (
                <tr>
                  <td colSpan="100%" style={{ padding: "2rem", color: "#64748b", textAlign: "center" }}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row) =>
                  React.cloneElement(row, {
                    children: React.Children.map(row.props.children, (cell) => {
                      if (cell.type === "td") {
                        return React.cloneElement(cell, {
                          style: tdStyle(cell.props),
                        });
                      }
                      return cell;
                    }),
                  })
                )
              ),
            });
          }

          if (section.type === "thead") {
            return React.cloneElement(section, {
              children: React.Children.map(section.props.children, (row) =>
                React.cloneElement(row, {
                  children: React.Children.map(row.props.children, (cell) => {
                    if (cell.type === "th") {
                      return React.cloneElement(cell, { style: thStyle });
                    }
                    return cell;
                  }),
                })
              ),
            });
          }

          return section;
        }),
      });
    }
    return child;
  });

  return (
    <div style={{ ...baseStyle, ...style }} className={className}>
      {styledChildren}
    </div>
  );
}