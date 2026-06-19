import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import OIPopup from "./OpeningItemHelp.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PurchaseItemPopup from "./PurchaseItemPopup";
import { showConfirmationToast } from './ToastConfirmation';
import LoadingScreen from './Loading';

const config = require("./Apiconfig");

function OpeningbalanceGrid() {
  const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: "", itemName: "", purchaseQty: "" },]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [transaction_date, settransaction_date] = useState("");
  const [transaction_no, settransaction_no] = useState("");
  const [additionalData, setAdditionalData] = useState({
    modified_by: "",
    created_by: "",
    modified_date: "",
    created_date: "",
  });
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [showAsterisk, setShowAsterisk] = useState(false);
  const [loading, setLoading] = useState(false);

  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || {};
  const openingItemPermission = permissions
    .filter((permission) => permission.screen_type === "OpeningItem")
    .map((permission) => permission.permission_type.toLowerCase());

    useEffect(() => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); 
      const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const financialYearStartDate = `${startYear}-04-01`; 
      settransaction_date(financialYearStartDate);
   
    }, []);

  const handleClickOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber;
    setGlobal(GlobalSerialNumber);
    const GlobalItem = params.data.itemCode;
    setGlobalItem(GlobalItem);
    setOpen1(true);
    console.log("Opening popup...");
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber;
    const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);
    setRowData(updatedRowData);

    if (updatedRowData.length === 0) {
      const newRow = {
        serialNumber: 1,
        itemCode: '',
        itemName: '',
        Hsn: '',
        purchaseQty: '',
        baseuom: '',
        purchaseAmt: '',
        TotalItemAmount: ''
      };
      setRowData([newRow]);
    }
    else {
      const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
        ...row,
        serialNumber: index + 1
      }));
      setRowData(updatedRowDataWithNewSerials);
    }
  };

  const columnDefs = [
    {
      headerName: "S.No",
      field: "serialNumber",
      maxWidth: 80,
      sortable: false,
      editable: false,
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 25,
      tooltipValueGetter: (p) =>
        "Delete",
      onCellClicked: handleDelete,
      cellRenderer: function (params) {
        return <FontAwesomeIcon icon="fa-solid fa-trash" style={{ cursor: 'pointer', marginRight: "12px" }} />
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      sortable: false
    },
    {
      headerName: "Item Code",
      field: "itemCode",
      editable: !showAsterisk,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleItemCode(params);
      },
      sortable: false,
    },
    {
      headerName: "Item Name",
      field: "itemName",
      editable: false,
      filter: true,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showSearchIcon = isWideEnough;

        return (
          <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%' }}>
            <div className="flex-grow-1">
              {params.editing ? (
                <input
                  type="text"
                  className="form-control"
                  value={params.value || ''}
                  onChange={(e) => params.setValue(e.target.value)}
                  style={{ width: '100%' }}
                />
              ) : (
                params.value
              )}
            </div>

            {showSearchIcon && (
              <span
                className="icon searchIcon"
                style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                onClick={() => handleClickOpen(params)}
              >
                <i className="fa fa-search"></i>
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: "Qty",
      field: "billQty",
      editable: !showAsterisk,
      filter: true,
      sortable: false,
      cellEditorParams: {
        maxLength: 10,
      },
    },
  ];

  const handleItemCode = async (params) => {
    setLoading(true);
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    try {
      const response = await fetch(`${config.apiBaseUrl}/getitemcodepurdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_code, Item_code: params.data.itemCode }),
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRow = rowData.map((row) => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find((item) => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                itemCode: matchedItem.Item_code,
                itemName: matchedItem.Item_name,
              };
            }
          }
          return row;
        });
        setRowData(updatedRow);
        console.log(updatedRow);
      } else if (response.status === 404) {
        toast.warning("Data not found!", {
          onClose: () => {
            const updatedRowData = rowData.map((row) => {
              if (row.itemCode === params.data.itemCode) {
                return {
                  ...row,
                  itemCode: "",
                  itemName: "",
                };
              }
              return row;
            });
            setRowData(updatedRowData);
          },
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItem = async (selectedData) => {
    console.log("Selected Data:", selectedData);
    let updatedRowDataCopy = [...rowData];
    let highestSerialNumber = updatedRowDataCopy.reduce(
      (max, row) => Math.max(max, row.serialNumber),
      0
    );

    selectedData.forEach((item) => {
      const existingItemWithSameCode = updatedRowDataCopy.find(
        (row) => row.serialNumber === global && row.itemCode === globalItem
      );

      if (existingItemWithSameCode) {
        console.log("if", existingItemWithSameCode);
        existingItemWithSameCode.itemCode = item.itemCode;
        existingItemWithSameCode.itemName = item.itemName;
      } else {
        console.log("else");
        highestSerialNumber += 1;
        const newRow = {
          serialNumber: highestSerialNumber,
          itemCode: item.itemCode,
          itemName: item.itemName,
        };
        updatedRowDataCopy.push(newRow);
      }
    });

    setRowData(updatedRowDataCopy);
    return true;
  };

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    flex: 1,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex, newValue } = params;
    const lastRowIndex = rowData.length - 1;
    if (colDef.field === 'billQty') {
      const quantity = parseFloat(newValue);

      if (quantity > 0 && rowIndex === lastRowIndex) {
        const serialNumber = rowData.length + 1;
        const newRowData = {
          serialNumber,
          itemCode: null,
          itemName: null,
          billQty: null,
        };

        setRowData(prevRowData => [...prevRowData, newRowData]);
      }
    }
  };

  const handleSaveButtonClick = async () => {
    if (!transaction_date) {
      toast.warning("Missing require field");
      setError(" ");
      return;
    }

    const hasValidData = rowData.some(
      (row) =>
        row?.itemCode?.trim() !== "" ||
        row?.itemName?.trim() !== "" ||
        row?.purchaseQty?.trim() !== ""
    );

    if (!hasValidData) {
      toast.warning("No valid data available to save");
      return;
    }
    setLoading(true);

    try {
      const Header = {
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        transaction_date,
        created_by: sessionStorage.getItem("selectedUserCode"),
      };

      const response = await fetch(`${config.apiBaseUrl}/openingitemhdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ transaction_no }] = searchData;
        settransaction_no(transaction_no);
        await OpeningItemDetails(transaction_no);
        toast.success("Data Inserted Successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const OpeningItemDetails = async (transaction_no) => {
    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.billQty > 0
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          created_by: sessionStorage.getItem("selectedUserCode"),
          transaction_date,
          transaction_no,
          Item_SNo: row.serialNumber,
          Item_code: row.itemCode,
          Item_name: row.itemName,
          bill_qty: row.billQty,
        };

        const response = await fetch(`${config.apiBaseUrl}/addOpeningItemDetail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        }
        );

        if (response.ok) {
          console.log("Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to insert sales data");
          console.error(errorResponse.details || errorResponse.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const handleDeleteButtonClick = async () => {
    if (!transaction_no) {
      setDeleteError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }

    showConfirmationToast(
      "Are you sure you want to delete the data?",
      async () => {
        setLoading(true);
        try {
          const detailResult = await OIDetailDelete();
          const headerResult = await OIHeaderDelete();

          if (headerResult === true && detailResult === true) {
            console.log("Data Deleted Successfully");
            toast.success("Data Deleted Successfully", {
              autoClose: true,
              onClose: () => {
                window.location.reload();
              },
            });
          } else {
            const errorMessage = headerResult !== true ? headerResult : detailResult;
            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Error executing API calls:", error);
          toast.error('Error occurred: ' + error.message);
        } finally {
          setLoading(false)
        }
      },
      () => {
        toast.info("Data deletion cancelled.");
      }
    );
  };

  const OIHeaderDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/openingitemdelhdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no,
          company_code: sessionStorage.getItem("selectedCompanyCode")
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.details || errorResponse.message);
        return errorResponse.message || errorResponse.details;
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      return "Error occurred during header deletion.";
    }
  };

  const OIDetailDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/deleteOpeningItemDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no,
          company_code: sessionStorage.getItem("selectedCompanyCode")
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.details || errorResponse.message);
        return errorResponse.message || errorResponse.details;
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      return "Error occurred during detail deletion.";
    }
  };

  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;
    const newRow = { serialNumber, itemCode: "", itemName: "", purchaseQty: 0 };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([
          { serialNumber: 1, itemCode: "", itemName: "", purchaseQty: "" },
        ]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleOpeningItem(transaction_no);
    }
  };

  const handleOpeningItem = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getallOpeningItem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") }),
      });
      if (response.ok) {
        setSaveButtonVisible(false);
        setShowAsterisk(true);
        const searchData = await response.json();
        if (searchData.Header && searchData.Header.length > 0) {
          const item = searchData.Header[0];
          settransaction_date(formatDate(item.transaction_date));
          settransaction_no(item.transaction_no);
        } else {
          console.log("Header Data is empty or not found");
          settransaction_date("");
          settransaction_no("");
        }

        if (searchData.Details && searchData.Details.length > 0) {
          const updatedRowData = searchData.Details.map((item) => {
            return {
              serialNumber: item.Item_SNo,
              itemCode: item.Item_code,
              itemName: item.Item_name,
              billQty: item.bill_qty
            };
          });

          setRowData(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([
            {
              serialNumber: 1,
              itemCode: "",
              itemName: "",
              billQty: "",
            },
          ]);
        }

        console.log("data fetched successfully");
      } else if (response.status === 404) {
        toast.warning("Data not found");

        settransaction_date("");
        settransaction_no("");
        setRowData([
          {
            serialNumber: 1,
            itemCode: "",
            itemName: "",
            billQty: "",
          },
        ]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [global, setGlobal] = useState(null);
  const [globalItem, setGlobalItem] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
  };

  const handleOpeningBalance = () => {
    setOpen(true);
  };

  const handleOI = async (data) => {
    if (data && data.length > 0) {
      setSaveButtonVisible(false);
      setShowAsterisk(true);
      const [{ transactionNo, transactionDate }] = data;

      const No = document.getElementById("transactionNO");
      if (No) {
        No.value = transactionNo;
        settransaction_no(transactionNo);
      } else {
        console.error("transactionNO element not found");
      }

      const Date = document.getElementById("transactionDate");
      if (Date) {
        Date.value = transactionDate;
        settransaction_date(formatDate(transactionDate));
      } else {
        console.error("transactionDate element not found");
      }

      await OpeningBalanceDetail(transactionNo);
    } else {
      console.log("Data not fetched...!");
    }
  };

  const OpeningBalanceDetail = async (transactionNo) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/getallOpeningItemDetail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transaction_no: transactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        searchData.forEach((item) => {
          const {
            Item_SNo,
            Item_code,
            Item_name,
            bill_qty
          } = item;
          newRowData.push({
            serialNumber: Item_SNo,
            itemCode: Item_code,
            itemName: Item_name,
            billQty: bill_qty
          });
        });
        setRowData(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className=" d-flex justify-content-between">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut me-5">
                Opening Item
              </h1>
            </div>
            <div className="d-flex justify-content-end purbut me-3">
              {saveButtonVisible &&
                ["add", "all permission"].some((permission) =>
                  openingItemPermission.includes(permission)
                ) && (
                  <savebutton
                    className="purbut"
                    title="Save"
                    onClick={handleSaveButtonClick}
                  >
                    <i class="fa-regular fa-floppy-disk"></i>
                  </savebutton>
                )}
              {["delete", "all permission"].some((permission) =>
                openingItemPermission.includes(permission)
              ) && (
                  <delbutton
                    className="purbut"
                    title="Delete"
                    onClick={handleDeleteButtonClick}
                  >
                    <i class="fa-solid fa-trash"></i>
                  </delbutton>
                )}
              <printbutton className="purbut" title="Reload" onClick={handleReload}>
                <i class="fa-solid fa-arrow-rotate-right"></i>
              </printbutton>
            </div>
            <div class="mobileview">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="h1">
                    Opening Item
                  </h1>
                </div>
                <div class="dropdown mt-2 me-4">
                  <button
                    class="btn btn-primary dropdown-toggle p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu menu">
                    {saveButtonVisible && (
                      <li class="iconbutton d-flex justify-content-center text-success">
                        {["add", "all permission"].some((permission) =>
                          openingItemPermission.includes(permission)
                        ) && (
                            <icon class="icon" onClick={handleSaveButtonClick}>
                              <i class="fa-regular fa-floppy-disk"></i>
                            </icon>
                          )}
                      </li>
                    )}
                    <li class="iconbutton  d-flex justify-content-center text-danger">
                      {["delete", "all permission"].some((permission) =>
                        openingItemPermission.includes(permission)
                      ) && (
                          <icon class="icon" onClick={handleDeleteButtonClick}>
                            <i class="fa-solid fa-trash"></i>
                          </icon>
                        )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center">
                      <icon class="icon" onClick={handleReload}>
                        <i class="fa-solid fa-arrow-rotate-right"></i>
                      </icon>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="shadow-lg p-1 bg-body-tertiary rounded  pt-4 "
          align="left"
        >
          <div className="row ms-3 mb-3 me-3">
            <div className="col-md-3 form-group ">
              <div class="exp-form-floating">
                <label for="rolname" className={`${deleteError && !transaction_no ? "red" : ""}`}>
                  Transaction No {showAsterisk && <span className="text-danger">*</span>}
                </label>
                <div class="d-flex justify-content-end">
                  <input
                    id="transactionNO"
                    className="exp-input-field form-control justify-content-start"
                    type="text"
                    placeholder=""
                    required
                    title="Please fill the transaction no here"
                    value={transaction_no}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                    onChange={(e) => settransaction_no(e.target.value)}
                  />
                  <div className="position-absolute mt-1 me-2">
                    <span
                      className="icon searchIcon"
                      title="Opening Item Help"
                      onClick={handleOpeningBalance}
                    >
                      <i class="fa fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="rolname" className={`${error && !transaction_date ? "red" : ""}`}>
                  Transaction Date{!showAsterisk && <span className="text-danger">*</span>}
                </label>
                <input
                  id="transactionDate"
                  className="exp-input-field form-control"
                  type="date"
                  value={transaction_date}
                  onChange={(e) => settransaction_date(e.target.value)}
                  readOnly 
                  title="Transaction date is fixed and based on the financial year."
                />
              </div>
            </div>
          </div>
          <div
            class="d-flex justify-content-end mb-2"
            style={{ marginRight: "50px" }}
          >
            <icon type="button" class="popups-btn" title='Add row' onClick={handleAddRow}>
              <FontAwesomeIcon icon={faPlus} />
            </icon>
            <icon type="button" class="popups-btn" title='Less row' onClick={handleRemoveRow}>
              <FontAwesomeIcon icon={faMinus} />
            </icon>
          </div>
          <div class="ag-theme-alpine" style={{ height: 545, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              onCellValueChanged={handleCellValueChanged}
              paginationAutoPageSize={true}
              pagination={true}
            />
          </div>
          <div>
            <OIPopup
              open={open}
              handleClose={handleClose}
              handleOb={handleOI}
            />
            <PurchaseItemPopup
              open={open1}
              handleClose={handleClose}
              handleItem={handleItem}
            />
          </div>
        </div>
      </div>
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              Created_by: {additionalData.created_by}
              </p>
            <p className="col-md-">
              Created_date: {additionalData.created_date}
            </p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              modified_by: {additionalData.modified_by}
            </p>
            <p className="col-md-6">
              modified_date: {additionalData.modified_date}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpeningbalanceGrid;
