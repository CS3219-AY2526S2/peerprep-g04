import React, { useState } from "react";

export function Table({
  children,
  style = {},
  className = "",
  emptyMessage = "No data available",
  minWidth = "100%",
  pageSize = 10,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const baseStyle = {
    background: "white",
    boxSizing: "border-box",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "1.25rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
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

  let totalRowsCount = 0;

  const styledChildren = React.Children.map(children, (child) => {
    if (child.type === "table") {
      return React.cloneElement(child, {
        style: tableStyle,
        children: React.Children.map(child.props.children, (section) => {
          
          if (section.type === "thead") {
            return React.cloneElement(section, {
              children: React.Children.map(section.props.children, (row) =>
                React.cloneElement(row, {
                  children: React.Children.map(row.props.children, (cell) => {
                    if (cell.type === "th") return React.cloneElement(cell, { style: thStyle });
                    return cell;
                  }),
                })
              ),
            });
          }

          if (section.type === "tbody") {
            const allRows = React.Children.toArray(section.props.children);
            totalRowsCount = allRows.length;

            const isEmpty = allRows.length === 0;
            const startIndex = (currentPage - 1) * pageSize;
            const paginatedRows = allRows.slice(startIndex, startIndex + pageSize);

            return React.cloneElement(section, {
              children: isEmpty ? (
                <tr>
                  <td colSpan="100%" style={{ padding: "2rem", color: "#64748b", textAlign: "center" }}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) =>
                  React.cloneElement(row, {
                    children: React.Children.map(row.props.children, (cell) => {
                      if (cell.type === "td") {
                        return React.cloneElement(cell, { style: tdStyle(cell.props) });
                      }
                      return cell;
                    }),
                  })
                )
              ),
            });
          }

          return section;
        }),
      });
    }
    return child;
  });

  const totalPages = Math.ceil(totalRowsCount / pageSize);

  const PaginationFooter = () => {
    if (totalPages <= 1) return null;

    const btnStyle = (disabled) => ({
      padding: "0.4rem 0.8rem",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: disabled ? "#f8fafc" : "white",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "0.8rem",
      color: disabled ? "#cbd5e1" : "#475569",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.18s ease",
    });

    return (
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "1rem",
      }}>
        <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
          Page <b>{currentPage}</b> of <b>{totalPages}</b>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            disabled={currentPage === 1}
            style={btnStyle(currentPage === 1)}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            disabled={currentPage === totalPages}
            style={btnStyle(currentPage === totalPages)}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...baseStyle, ...style }} className={className}>
      {styledChildren}
      <PaginationFooter />
    </div>
  );
}