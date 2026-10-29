import React, { useState, useRef, useEffect } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AgGridReact } from "ag-grid-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReceivedGoodsPopup from "./ReceivedGoodsHelp";
import * as XLSX from "xlsx";
import { useLocation } from 'react-router-dom';
import Select from "react-select";

const config = require("../Apiconfig");

function AssetsReturn({ }) {
  const [rowData, setRowData] = useState([]);
  const [allReceivedGoodsRows, setAllReceivedGoodsRows] = useState([]);
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionNo, setTransactionNo] = useState("");

  const [selectedAmendment, setSelectedAmendment] = useState("");
  const [selectedDropdown, setSelectedDropdown] = useState("");
  const [status, setStatus] = useState("");

  const [selectedscreens, setSelectedscreens] = useState(null);
  const [Screens, setScreens] = useState('Add');
  const [screensDrop, setScreensDrop] = useState([]);

  const [amendmentNo, setAmendmentNo] = useState('');
  const [selectedAmendmentNo, setSelectedAmendmentNo] = useState('');
  const [amendmentNoDrop, setAmendmentNoDrop] = useState([]);

  const handleChangeAmendmentNo = (selectedOption) => {
    setSelectedAmendmentNo(selectedOption);

    const selectedValue = selectedOption ? selectedOption.value : "";

    setAmendmentNo(selectedValue);
    setSelectedAmendment(selectedOption);

    if (selectedValue === "") {
      setRowData([]);
      setStatus("");
      return;
    }

    const filteredRows = allReceivedGoodsRows.filter(
      (row) => String(row.amendment_no) === String(selectedValue)
    );

    console.log("Selected Amendment No:", selectedValue);
    console.log("Filtered Amendment Rows:", filteredRows);

    setRowData(filteredRows);
    setStatus(filteredRows[0]?.status || "");

    if (filteredRows.length === 0) {
      toast.warning("No records found for selected Amendment No");
    }
  };

  const filteredOptionAmendmentNo = amendmentNoDrop.map((option) => ({
    value: String(option.amendment_no),
    label: String(option.amendment_no),
  }));

  const handleChangeScreens = (selected) => {
    setSelectedscreens(selected);
    setScreens(selected?.value || "");
    setScreens(selected?.value || "");
  };

  const filteredOptionScreens = (Array.isArray(screensDrop) ? screensDrop : []).map((option) => ({
    value: option.descriptions,
    label: option.attributedetails_name,
  }));

  const fetchAmendmentNumbers = async (billNo) => {
    if (!billNo || !String(billNo).trim()) {
      setAmendmentNoDrop([]);
      return;
    }

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/getAmendmentNumberDrop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            bill_no: String(billNo).trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      console.log("Amendment API Response:", data);

      const amendmentData = Array.isArray(data)
        ? data
        : Array.isArray(data?.recordset)
          ? data.recordset
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setAmendmentNoDrop(amendmentData);

    } catch (error) {
      console.error("Error fetching amendment numbers:", error);
      setAmendmentNoDrop([]);
    }
  };


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setScreensDrop(data);

        // Automatically set a default option (e.g., "Draft" or the first record)
        const defaultScreen =
          data.find((item) => item.descriptions === "Draft") || data[0];

        if (defaultScreen && !selectedscreens) {
          setSelectedscreens({
            value: defaultScreen.descriptions,
            label: defaultScreen.attributedetails_name,
          });
          setScreens(defaultScreen.descriptions);
        }
      })
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  const [gridApi, setGridApi] = useState(null);
  const redirectLoadedRef = useRef(false);
  const location = useLocation();

  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || {};
  const purchasePermission = permissions
    .filter((permission) => permission.screen_type === "ReceivedGoods")
    .map((permission) => permission.permission_type.toLowerCase());

  useEffect(() => {
    const redirectDCNo = location.state?.transactionNo;

    if (redirectDCNo && !redirectLoadedRef.current) {
      redirectLoadedRef.current = true;

      setTransactionNo(redirectDCNo);
      fetchReceivedGoodsData(redirectDCNo);
    }
  }, [location.state]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ensure keys only trigger on F-keys
      if (!["F1", "F2", "F3", "F4", "F5", "F6", "F8"].includes(e.key)) {
        return;
      }

      // 2. Prevent default browser shortcut actions (e.g., F1 Help, F5 Refresh)
      e.preventDefault();
      e.stopPropagation();

      switch (e.key) {
        case "F3":
          // New / Reset Sales Invoice Form
          if (
            window.confirm(
              "Start a new adjustment? Unsaved changes will be lost.",
            )
          ) {
            handleReload();
          }
          break;

        case "F4":
          // Save / Complete Invoice (Same logic as Save Button)
          updateSelectedRows();
          break;

        case "F5":
          // Search Existing Invoices to Edit
          setOpen(true);
          break;

        default:
          break;
      }
    };

    // Attach listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [transactionNo, rowData]);

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const columnDefs = [
    {
      headerName: "Item S.No",
      field: "itemSNo",
      editable: false,
      // minWidth: 100,
      maxWidth: 120,
      filter: true,
      sortable: false,
    },
    {
      headerName: "Item Code",
      field: "itemCode",
      editable: false,
      maxWidth: 150,
      filter: true,
      sortable: false,
    },
    {
      headerName: "Item Name",
      field: "itemName",
      editable: false,
      maxWidth: 220,
      filter: true,
      sortable: false,
      editable: false,
    },
    {
      headerName: "PO Qty",
      field: "po_qty",
      editable: false,
      maxWidth: 150,
      filter: true,
      sortable: false,
      cellStyle: { textAlign: 'right' },
    },
    {
      headerName: "Received Qty",
      field: "receiveQty",
      editable: false,
      maxWidth: 150,
      filter: true,
      sortable: false,
      cellStyle: { textAlign: 'right' },
    },
    {
      headerName: "Balance Qty",
      field: "bal_qty",
      editable: false,
      maxWidth: 150,
      filter: true,
      sortable: false,
      cellStyle: { textAlign: 'right' },
    },
    {
      headerName: "Quantity to Receive",
      field: "qty_to_receive",
      editable: true,
      maxWidth: 180,
      filter: true,
      sortable: false,
      cellStyle: { textAlign: 'right' },
      valueSetter: (params) => {
        const newValue = Number(params.newValue);
        const balanceQty = Number(params.data.balanceQty);
        const itemCode = params.data.itemCode;

        if (isNaN(newValue)) {
          toast.warning(
            `Item Code: ${itemCode} - Please enter a valid number for Receive Qty.`,
          );
          return false;
        }

        if (newValue > balanceQty) {
          toast.warning(
            `Item Code: ${itemCode} - Receive Qty (${newValue}) cannot be greater than Balance Qty (${balanceQty}).`,
          );
          return false;
        }

        // Valid case
        params.data.qty_to_receive = newValue;
        return true;
      },
    },
    {
      headerName: "Accepted Qty",
      field: "accepted_qty",
      editable: true,
      maxWidth: 150,
      filter: true,
      sortable: false,
      cellStyle: { textAlign: 'right' },
    },
    {
      headerName: "Rejected Qty",
      field: "rejected_qty",
      editable: true,
      maxWidth: 150,
      filter: true,
      sortable: false,
      cellStyle: { textAlign: 'right' },
    },
    {
      headerName: "Keyfield",
      field: "keyfield",
      editable: false,
      hide: true,
      filter: true,
    },
  ];

  //Default Date functionality
  // Default Transaction Date
  useEffect(() => {
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    setTransactionDate(formattedToday);
  }, []);

  const authorizeSelectedRows = async () => {
    if (!transactionNo) {
      toast.warning("Please select a Transaction No.");
      return;
    }

    if (
      amendmentNo === "" ||
      amendmentNo === null ||
      amendmentNo === undefined
    ) {
      toast.warning("Please select an Amendment No.");
      return;
    }

    if (!selectedscreens?.value) {
      toast.warning("Please select a Status.");
      return;
    }

    if (!gridApi) {
      toast.warning("Grid is not ready.");
      return;
    }

    const allRowsData = [];

    gridApi.forEachNode((node) => {
      allRowsData.push(node.data);
    });

    if (allRowsData.length === 0) {
      toast.warning("No rows available for authorization.");
      return;
    }

    const editedData = allRowsData.map((row) => ({
      transactionNo: transactionNo,
      amendment_no: Number(amendmentNo),
      status: Screens,
      modified_by: sessionStorage.getItem("selectedUserCode"),
    }));

    console.log("AU Mode Payload:", editedData);

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/authorizeReceivedGoods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          },
          body: JSON.stringify({
            editedData: editedData,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("AU Mode Response:", result);

        toast.success("Received Goods authorization updated successfully.");

        // Refresh grid after authorization
        await fetchReceivedGoodsData(transactionNo);

      } else {
        toast.warning(
          result.message || "Failed to update Received Goods authorization."
        );
      }

    } catch (error) {
      console.error("AU Mode Error:", error);
      toast.error("Authorization Error: " + error.message);
    }
  };

  const fetchReceivedGoodsData = async (TransactionNo) => {
    try {
      const billNo = String(TransactionNo || transactionNo || "").trim();

      const body = {
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        bill_no: billNo,
      };

      const response = await fetch(`${config.apiBaseUrl}/getReceivedGoods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const searchData = await response.json();

        if (searchData.length > 0) {
          // Fetch amendment numbers for the selected Transaction No
          await fetchAmendmentNumbers(searchData[0].bill_no);
          const {
            bill_no,
            bill_date,
            amendment_no,
            status: fetchedStatus
          } = searchData[0];

          setTransactionNo(bill_no);
          setTransactionDate(formatDate(bill_date));

          // Fetch amendment number
          if (amendment_no !== null && amendment_no !== undefined) {
            const amendmentValue = String(amendment_no);

            const selectedOption = {
              value: amendmentValue,
              label: amendmentValue,
            };

            setSelectedAmendment(selectedOption);
            setSelectedAmendmentNo(selectedOption);
            setAmendmentNo(amendmentValue);
          } else {
            setSelectedAmendment(null);
            setSelectedAmendmentNo(null);
            setAmendmentNo("");
          }

          // Fetch status
          setStatus(fetchedStatus || "");

          const newRows = searchData.map((matchedItem) => ({
            transactionNo: matchedItem.bill_no,
            transactionDate: formatDate(matchedItem.bill_date),
            itemSNo: matchedItem.item_sno,
            itemCode: matchedItem.item_code,
            itemName: matchedItem.item_name,
            po_qty: matchedItem.po_qty,
            bal_qty: matchedItem.bal_qty,
            receivedQty: matchedItem.qty_to_receive,
            accepted_qty: matchedItem.accepted_qty,
            rejected_qty: matchedItem.rejected_qty,
            keyfield: matchedItem.keyfield,
            amendment_no: matchedItem.amendment_no,
            status: matchedItem.status,
            source: matchedItem.source,
            receiveQty: 0,
          }));
          // Store every amendment record
          setAllReceivedGoodsRows(newRows);

          // Show only the initially selected amendment
          const initialAmendment = searchData[0].amendment_no;

          const initialFilteredRows = newRows.filter(
            (row) =>
              String(row.amendment_no) === String(initialAmendment)
          );

          setRowData(initialFilteredRows);

          console.log("All Received Goods:", newRows);
          console.log("Initially Displayed Rows:", initialFilteredRows);
        } else {
          toast.warning("Data Not found");
          setRowData([]);
          setAllReceivedGoodsRows([]);
        }
      } else if (response.status === 404) {
        toast.warning("Data Not found");
        setRowData([]);
        setAllReceivedGoodsRows([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const updateSelectedRows = async () => {
    const allRowsData = [];
    gridApi.forEachNode((node) => allRowsData.push(node.data));

    const filteredRows = allRowsData
      .filter((row) => row.qty_to_receive > 0)
      .map((row) => ({
        ...row,
        status: Screens,
      }));

    const invalidRows = filteredRows.filter((row) => {
      const receiveQty = Number(row.qty_to_receive);
      const acceptedQty = Number(row.accepted_qty);
      const rejectedQty = Number(row.rejected_qty);

      return (
        !Number.isFinite(receiveQty) ||
        !Number.isFinite(acceptedQty) ||
        !Number.isFinite(rejectedQty) ||
        acceptedQty < 0 ||
        rejectedQty < 0 ||
        Math.abs(receiveQty - (acceptedQty + rejectedQty)) > 0.000001
      );
    });

    if (invalidRows.length > 0) {
      toast.warning(
        `Item Code: ${invalidRows[0].itemCode} - Qty to Receive must equal Accepted Qty + Rejected Qty.`
      );
      return;
    }

    if (filteredRows.length === 0) {
      toast.warning(
        "No valid rows found with Received Amount greater than zero to update",
      );
      return;
    }

    try {
      const company_code = sessionStorage.getItem("selectedCompanyCode");
      const response = await fetch(`${config.apiBaseUrl}/updateReceivedGoods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          company_code: company_code,
        },
        body: JSON.stringify({ editedData: filteredRows }),
      });

      if (response.ok) {
        const updatedData = await response.json();

        console.log("Updated Received Goods:", updatedData);

        if (Array.isArray(updatedData) && updatedData.length > 0) {
          const latestRecord = updatedData[updatedData.length - 1];

          setSelectedAmendment({
            value: String(latestRecord.amendment_no),
            label: String(latestRecord.amendment_no)
          });

          setStatus(latestRecord.status || "");
        }

        toast.success("Data updated successfully", {
          onClose: () => fetchReceivedGoodsData(),
        });
      } else {
        const errorResponse = await response.json();
        toast.warning(
          errorResponse.message || "Failed to update received goods data",
        );
      }
    } catch (error) {
      console.error("Error updating rows:", error);
      toast.error("Error Updating Data: " + error.message);
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };



  const insertSelectedRows = async () => {
    if (!gridApi) {
      toast.warning("Grid is not ready.");
      return;
    }

    if (!transactionNo || !transactionDate) {
      toast.warning("Transaction No and Transaction Date are required.");
      return;
    }

    // Collect ALL rows from AG Grid
    const allRowsData = [];

    gridApi.stopEditing();

    gridApi.forEachNode((node) => {
      allRowsData.push(node.data);
    });

    if (allRowsData.length === 0) {
      toast.warning("No rows available to insert.");
      return;
    }

    // Prepare ALL rows without filtering any row
    const editedData = allRowsData.map((row) => ({
      ...row,
      transactionNo: transactionNo,
      transactionDate: transactionDate,
      itemSNo: row.itemSNo,
      itemCode: row.itemCode,
      itemName: row.itemName,
      po_qty: Number(row.po_qty) || 0,
      qty_to_receive: Number(row.qty_to_receive) || 0,
      accepted_qty: Number(row.accepted_qty) || 0,
      rejected_qty: Number(row.rejected_qty) || 0,
      status: Screens,
      source: row.source,
      amendment_no: selectedAmendment?.value
        ? Number(selectedAmendment.value)
        : 0,
      keyfield: row.keyfield || "",
      created_by:
        sessionStorage.getItem("selectedUserCode") || "",
    }));

    // Validate quantity for every row
    const invalidRow = editedData.find((row) => {
      return (
        !Number.isFinite(row.qty_to_receive) ||
        !Number.isFinite(row.accepted_qty) ||
        !Number.isFinite(row.rejected_qty) ||
        row.qty_to_receive < 0 ||
        row.accepted_qty < 0 ||
        row.rejected_qty < 0 ||
        Math.abs(
          row.qty_to_receive -
          (row.accepted_qty + row.rejected_qty)
        ) > 0.000001
      );
    });

    if (invalidRow) {
      toast.warning(
        `Item Code: ${invalidRow.itemCode} - Qty to Receive must equal Accepted Qty + Rejected Qty.`
      );
      return;
    }

    try {
      const company_code =
        sessionStorage.getItem("selectedCompanyCode");

      const response = await fetch(
        `${config.apiBaseUrl}/insertReceivedGoods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            company_code: company_code,
          },
          body: JSON.stringify({
            editedData: editedData,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("All Inserted Received Goods:", result);

        toast.success("All rows processed successfully", {
          onClose: () => fetchReceivedGoodsData(transactionNo),
        });
      } else {
        toast.warning(
          result.message || "Failed to insert received goods data"
        );
      }
    } catch (error) {
      console.error("Error inserting received goods:", error);

      toast.error(
        "Error Inserting Data: " + error.message
      );
    }
  };



  const [open, setOpen] = React.useState(false);

  const handlePurchase = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRGData = async (data) => {
    if (data && data.length > 0) {
      const [{ TransactionNo, EntryDate }] = data;

      console.log("Selected Transaction No:", TransactionNo);

      setTransactionNo(TransactionNo);

      await fetchReceivedGoodsData(TransactionNo);

      const transactionNumber = document.getElementById("transactionNo");
      if (transactionNumber) {
        transactionNumber.value = TransactionNo;
        setTransactionNo(TransactionNo);
      } else {
        console.error("transactionNumber element not found");
      }

      const transactionDate = document.getElementById("transactionDate");
      if (transactionDate) {
        transactionDate.value = EntryDate;
        setTransactionDate(formatDate(EntryDate));
      } else {
        console.error("transactionDate element not found");
      }
    } else {
      console.log("Data not fetched...!");
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  // const transformRowData = (data) => {
  //   return data.map((row) => ({
  //     "Item S.No": row.itemSNo,
  //     "Item Code": row.itemCode.toString(),
  //     "Item Name": row.itemName.toString(),
  //     "Bill Qty": row.billQty.toString(),
  //     "Balance Qty": row.balanceQty.toString(),
  //     "Receive Qty": row.receiveQty.toString(),
  //   }));
  // };

  //   const handleExcelDownload = () => {
  //     const filteredRowData = rowData.filter(row => row.receiveQty > 0);

  //     if (rowData.length === 0 || !transactionNo || !transactionDate) {
  //       toast.warning('No Data Available');
  //       return;
  //     }

  //     const headerData = [{
  //       "company Code": sessionStorage.getItem('selectedCompanyCode'),
  //       "Transaction No": transactionNo,
  //       "Transaction Date": transactionDate,
  //     }];

  //     const transformedData = transformRowData(filteredRowData);
  //     const rowDataSheet = XLSX.utils.json_to_sheet(transformedData);
  //     const headerSheet = XLSX.utils.json_to_sheet(headerData);

  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
  //     XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Details Data");

  //     XLSX.writeFile(workbook, "Received_Goods.xlsx");
  //   };

  // const handleExcelDownload = () => {
  //   // const filteredRowData = rowData.filter(row => row.receiveQty > 0);
  //   const filteredRowData = rowData;
  //   if (rowData.length === 0 || !transactionNo || !transactionDate) {
  //     toast.warning("No Data Available");
  //     return;
  //   }

  //   const headerData = [
  //     {
  //       "Transaction No": transactionNo,
  //       "Transaction Date": transactionDate,
  //     },
  //   ];

  //   const transformedData = transformRowData(filteredRowData);

  //   // Header Sheet
  //   const headerSheet = XLSX.utils.aoa_to_sheet([
  //     ["Received Goods"],
  //     [`Company Name: ${sessionStorage.getItem("selectedCompanyName")}`],
  //     [],
  //   ]);

  //   XLSX.utils.sheet_add_json(headerSheet, headerData, {
  //     origin: "A4",
  //   });

  //   // Merge Heading
  //   headerSheet["!merges"] = [
  //     {
  //       s: { r: 0, c: 0 }, // A1
  //       e: { r: 0, c: 7 }, // H1
  //     },
  //     {
  //       s: { r: 1, c: 0 }, // A2
  //       e: { r: 1, c: 7 }, // H2
  //     },
  //   ];

  //   // Details Sheet
  //   const rowDataSheet = XLSX.utils.json_to_sheet(transformedData);

  //   // Auto Fit Function
  //   const autoFitColumns = (worksheet, data) => {
  //     if (!data || data.length === 0) return;

  //     const cols = [];

  //     data.forEach((row) => {
  //       Object.keys(row).forEach((key, i) => {
  //         const value = row[key] == null ? "" : row[key].toString();

  //         cols[i] = Math.max(cols[i] || key.length, key.length, value.length);
  //       });
  //     });

  //     worksheet["!cols"] = cols.map((width) => ({
  //       wch: width + 5,
  //     }));
  //   };

  //   // Apply Auto Width
  //   autoFitColumns(headerSheet, headerData);
  //   autoFitColumns(rowDataSheet, transformedData);

  //   // Workbook
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
  //   XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Details Data");

  //   XLSX.writeFile(workbook, "Received_Goods.xlsx");
  // };

  const transformRowData = (data) => {
    return data.map((row) => ({
      "Item S.No": row.itemSNo ?? "",
      "Item Code": String(row.itemCode ?? ""),
      "Item Name": String(row.itemName ?? ""),
      "PO Qty": Number(row.po_qty) || 0,
      "Received Qty": Number(row.receiveQty) || 0,
      "Balance Qty": Number(row.bal_qty) || 0,
      "Quantity to Receive": Number(row.qty_to_receive) || 0,
      "Accepted Qty": Number(row.accepted_qty) || 0,
      "Rejected Qty": Number(row.rejected_qty) || 0,
    }));
  };

  const handleExcelDownload = () => {
    if (!gridApi) {
      toast.warning("Grid is not ready");
      return;
    }

    // Stop active cell editing so newly typed values are captured
    gridApi.stopEditing();

    // Extract current data from all grid nodes (including edited values)
    const currentGridRows = [];
    gridApi.forEachNode((node) => {
      if (node.data) {
        currentGridRows.push(node.data);
      }
    });

    if (currentGridRows.length === 0) {
      toast.warning("No Data Available in Grid");
      return;
    }

    const companyName = sessionStorage.getItem("selectedCompanyName") || "";

    // 1. Title & Metadata Header Rows
    const headerRows = [
      ["Received Goods"],
      [`Company Name: ${companyName}`],
      [`Transaction No: ${transactionNo || ""}`, `Transaction Date: ${transactionDate || ""}`, `Amendment No: ${amendmentNo || ""}`, `Status: ${status || ""}`],
      [], // Empty row before table details
    ];

    const transformedData = transformRowData(currentGridRows);

    // 2. Build the Worksheet starting with the metadata header
    const worksheet = XLSX.utils.aoa_to_sheet(headerRows);

    // 3. Append the Grid Details table starting at row 5 (A5)
    XLSX.utils.sheet_add_json(worksheet, transformedData, {
      origin: "A5",
      header: [
        "Item S.No",
        "Item Code",
        "Item Name",
        "PO Qty",
        "Received Qty",
        "Balance Qty",
        "Quantity to Receive",
        "Accepted Qty",
        "Rejected Qty",
      ],
    });

    // 4. Merge Title rows across the columns (Columns A through I)
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Row 1 (A1:I1)
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Row 2 (A2:I2)
    ];

    // 5. Dynamic column width autofitting based on headers and cell contents
    const keys = Object.keys(transformedData[0] || {});
    worksheet["!cols"] = keys.map((key) => {
      let maxLen = key.length;
      transformedData.forEach((row) => {
        const valStr = row[key] !== null && row[key] !== undefined ? String(row[key]) : "";
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      return { wch: Math.max(maxLen + 4, 12) };
    });

    // 6. Generate and save workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Received Goods");

    const fileName = `${transactionNo ? `${transactionNo}_` : ""}Received_Goods.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  return (
    <div class="container-fluid Topnav-screen">
      <ToastContainer
        position="top-right"
        className="toast-design"
        theme="colored"
      />
      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="d-flex justify-content-between">
          <div className=" justify-content-start">
            <h1 align="left" className="purbut me-5">
              Received Goods
            </h1>
          </div>
          <div class="d-flex justify-content-end purbut me-3">
            <div className="exp-form-floating">
              <div title="Select the Mode">
              <Select
                id="returnType"
                className="exp-input-field col-md-6 mt-2"
                placeholder=""
                required
                value={selectedscreens}
                onChange={handleChangeScreens}
                options={filteredOptionScreens}
                classNamePrefix="react-select"
                data-tip="Please select a default warehouse"
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
              />
              </div>
            </div>
            {["add", "all permission"].some((permission) =>
              purchasePermission.includes(permission),
            ) && (
                <savebutton
                  className="purbut"
                  title="save"
                  onClick={() => {
                    const selectedMode = Screens?.trim().toLowerCase();

                    if (selectedMode === "draft") {
                      insertSelectedRows();
                    } else if (
                      selectedMode === "authorized" ||
                      selectedMode === "deleted" ||
                      selectedMode === "short closed" ||
                      selectedMode === "reversed"
                    ) {
                      authorizeSelectedRows();
                    }
                  }}
                >
                  <i class="fa-regular fa-floppy-disk"></i>
                </savebutton>
              )}
            <printbutton
              className="purbut"
              title="excel"
              onClick={handleExcelDownload}
            >
              <i class="fa-solid fa-file-excel"></i>
            </printbutton>
            <printbutton
              className="purbut"
              onClick={handleReload}
              title="reload"
            >
              <i class="fa-solid fa-arrow-rotate-right"></i>
            </printbutton>
          </div>
          <div className="mobileview">
            <div class=" d-flex justify-content-between ">
              <div className="" style={{ textAlign: "left" }}>
                <h1 className="h1">Received Goods</h1>
              </div>
              <div className=" ">
                <div class="dropdown mt-2 me-3">
                  <button
                    class="btn btn-primary dropdown-toggle p-1 ms-3"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="fa-solid fa-list"></i>
                  </button>

                  <ul class="dropdown-menu menu">
                    <li class="iconbutton  d-flex justify-content-center text-success ">
                      {["update", "all permission"].some((permission) =>
                        purchasePermission.includes(permission),
                      ) && (
                          <icon class="icon"
                            onClick={() => {
                              const selectedMode = Screens?.trim().toLowerCase();

                              if (selectedMode === "draft") {
                                insertSelectedRows();
                              } else if (
                                selectedMode === "authorized" ||
                                selectedMode === "deleted" ||
                                selectedMode === "short closed" ||
                                selectedMode === "reversed"
                              ) {
                                authorizeSelectedRows();
                              }
                            }}
                          >
                            <i class="fa-regular fa-floppy-disk"></i>
                          </icon>
                        )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-info">
                      <icon class="icon" onClick={handleExcelDownload}>
                        <i class="fa-solid fa-file-excel"></i>
                      </icon>
                    </li>
                    <li class="iconbutton  d-flex justify-content-center">
                      <icon class="icon" onClick={handleReload} title="reload">
                        <i class="fa-solid fa-arrow-rotate-right"></i>
                      </icon>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow-lg p-1 bg-body-tertiary rounded  pb-4">
        <div class=" mt-4">
          <div className="row ms-3 ">
            <div className="col-md-2 form-group mb-2 ">
              <label class="exp-form-labels">Transaction No</label>
              <div className="exp-form-floating">
                <div class="d-flex justify-content-end">
                  <input
                    name="transactionDate"
                    id="transactionNo"
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    title="Enter the Transaction No"
                    required
                    autoComplete="off"
                    value={transactionNo}
                    onKeyDown={(e) =>
                      e.key === "Enter" && fetchReceivedGoodsData()
                    }
                    onChange={(e) => setTransactionNo(e.target.value)}
                  />
                  <div className="position-absolute mt-1 me-2">
                    <span className="icon searchIcon" onClick={handlePurchase}>
                      <i class="fa fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2 form-group mb-2 ">
              <div class="exp-form-floating">
                <label class="exp-form-labels">Transaction Date</label>
                <input
                  name="transactionDate"
                  id="transactionDate"
                  className="exp-input-field form-control"
                  title="Enter the Transaction Date"
                  type="date"
                  placeholder=""
                  required
                  value={transactionDate}
                />
              </div>
            </div>

            <div className="col-md-2  form-group">
              <div class="exp-form-floating">
                <label for="rid" class="exp-form-labels">Amendment No</label>
                <div title="Select a Amendment No">
                  <Select
                    id="status"
                    value={selectedAmendmentNo}
                    onChange={handleChangeAmendmentNo}
                    options={filteredOptionAmendmentNo}
                    className="exp-input-field"
                    classNamePrefix="react-select"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Status - Display Only */}
            <div className="col-md-2 form-group mb-2">
              <label htmlFor="status" className="exp-form-labels">
                Status
              </label>

              <div className="exp-form-floating">
                <input
                  id="status"
                  type="text"
                  className="exp-input-field form-control"
                  value={status}
                  placeholder=""
                  readOnly
                />
              </div>
            </div>
          </div>
          <div
            align="right"
            class="d-flex justify-content-end mb-2 me-6"
            style={{ marginRight: "90px" }}
          ></div>
          <div
            className="ag-theme-alpine"
            style={{ height: 437, width: "100%" }}
          >
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{ flex: true }}
              onGridReady={onGridReady}
              pagination={true}
              paginationAutoPageSize={true}
              headerHeight={28}
              rowHeight={25}
            />
          </div>
          <div>
            <ReceivedGoodsPopup
              open={open}
              handleClose={handleClose}
              handleRGData={handleRGData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default AssetsReturn;
