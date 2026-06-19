import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ItemDash.css';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import config from './Apiconfig';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from './Loading';
import LZString from "lz-string";

const DCanalysis = () => {
  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const [columnDefs] = useState([
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Transaction Date",
      field: "transaction_date",
    },
    {
      headerName: "Transaction No",
      field: "transaction_no",
    },
    {
      headerName: "Bill to Customer Name",
      field: "customer_name",
    },
    {
      headerName: "Bill to Address 1",
      field: "customer_addr_1",
    },
    {
      headerName: "Bill to Address 2",
      field: "customer_addr_2",
    },
    {
      headerName: "Bill to Address 3",
      field: "customer_addr_3",
    },
    {
      headerName: "Bill to Address 4",
      field: "customer_addr_4",
    },
    {
      headerName: "Bill to State",
      field: "customer_state",
    },
    {
      headerName: "Bill to Country",
      field: "customer_country",
    },
    {
      headerName: "Bill to Mobile No",
      field: "customer_mobile_no",
    },
    {
      headerName: "Bill to Contact Person",
      field: "contact_person",
    },
    {
      headerName: "Ship to Customer Name",
      field: "ShipTo_customer_name",
    },
    {
      headerName: "Ship to Address 1",
      field: "ShipTo_customer_addr_1",
    },
    {
      headerName: "Ship to Address 2",
      field: "ShipTocustomer_addr_2",
    },
    {
      headerName: "Ship to Address 3",
      field: "ShipTocustomer_addr_3",
    },
    {
      headerName: "Ship to Address 4",
      field: "ShipTocustomer_addr_4",
    },
    {
      headerName: "Ship to State",
      field: "ShipTocustomer_state",
    },
    {
      headerName: "Ship to Country",
      field: "ShipTocustomer_country",
    },
    {
      headerName: "Ship to Mobile No",
      field: "ShipTocustomer_mobile_no",
    },
    {
      headerName: "Ship to Contact Person",
      field: "ShipTocontact_person",
    },
    {
      headerName: "Total",
      field: "purchase_amount",
    },
    {
      headerName: "Round Off",
      field: "rounded_off",
    },
    {
      headerName: "Grand Total",
      field: "total_amount",
    },
  ]);

  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [period, setPeriod] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [shipToCustomerName, setShipToCustomerName] = useState("");
  const [shipToCustomerAddress, setShipToCustomerAddress] = useState("");
  const [perioddrop, setPerioddrop] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [start_Date, setStart_Date] = useState('');
  const [end_Date, setEnd_Date] = useState('');
  const companyName = sessionStorage.getItem('selectedCompanyName');
  const [loading, setLoading] = useState(false);

  const handleChangePeriod = (selectedPeriod) => {
    setSelectedPeriod(selectedPeriod);
    setPeriod(selectedPeriod ? selectedPeriod.value : '');
  };

  const filteredOptionPeriod = perioddrop.map((option) => ({
    value: option.Sno,
    label: option.DateRangeDescription,
  }));

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDateRange`)
      .then((data) => data.json())
      .then((val) => {
        setPerioddrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[4].Sno,
            label: val[4].DateRangeDescription,
          };
          setSelectedPeriod(firstOption);
          setPeriod(firstOption.value);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedPeriod?.label === "Custom Date") {
      if (startDate && endDate) {
        fetchDCData();
      }
    } else if (period) {
      fetchDCData();
    }
  }, []);

  const fetchDCData = async () => {
    setLoading(true);
    try {
      const body = {
        mode: period.toString(),
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        transaction_no: transactionNo,
        customer_name: customerName,
        ShipTo_customer_name: shipToCustomerName,
        ShipTo_customer_addr_1: shipToCustomerAddress,
        StartDate: selectedPeriod?.label === "Custom Date" ? startDate : undefined,
        EndDate: selectedPeriod?.label === "Custom Date" ? endDate : undefined,
      };

      const response = await fetch(`${config.apiBaseUrl}/getDCperiod`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const fetchedData = await response.json();
        if (fetchedData.length > 0) {
          const firstItem = fetchedData[0];
          setStart_Date(formatDate(firstItem.DateRange_Start) || "");
          setEnd_Date(formatDate(firstItem.DateRange_End) || "");
        }

        const newRows = fetchedData.map((matchedItem) => ({
          transaction_date: formatDate(matchedItem.transaction_date),
          transaction_no: matchedItem.transaction_no,
          customer_name: matchedItem.customer_name,
          Item_name: matchedItem.Item_name,
          customer_addr_1: matchedItem.customer_addr_1,
          customer_addr_2: matchedItem.customer_addr_2,
          customer_addr_3: matchedItem.customer_addr_3,
          customer_addr_4: matchedItem.customer_addr_4,
          customer_state: matchedItem.customer_state,
          customer_country: matchedItem.customer_country,
          customer_mobile_no: matchedItem.customer_mobile_no,
          contact_person: matchedItem.contact_person,
          ShipTo_customer_name: matchedItem.ShipTo_customer_name,
          ShipTo_customer_addr_1: matchedItem.ShipTo_customer_addr_1,
          ShipTocustomer_addr_2: matchedItem.ShipTocustomer_addr_2,
          ShipTocustomer_addr_3: matchedItem.ShipTocustomer_addr_3,
          ShipTocustomer_addr_4: matchedItem.ShipTocustomer_addr_4,
          ShipTocustomer_state: matchedItem.ShipTocustomer_state,
          ShipTocustomer_country: matchedItem.ShipTocustomer_country,
          ShipTocustomer_mobile_no: matchedItem.ShipTocustomer_mobile_no,
          ShipTocontact_person: matchedItem.ShipTocontact_person,
          purchase_amount: matchedItem.purchase_amount,
          rounded_off: matchedItem.rounded_off,
          total_amount: matchedItem.total_amount,
        }));
        const totalAmount = newRows.reduce((sum, row) => sum + row.total_amount, 0);
        const totalPurchase = newRows.reduce((sum, row) => sum + row.purchase_amount, 0);
        const totalRoundOff = newRows.reduce((sum, row) => sum + row.rounded_off, 0);

        const totalRow = {
          transaction_date: "",
          transaction_no: "",
          customer_name: "",
          customer_addr_1: "",
          customer_addr_2: "",
          customer_addr_3: "",
          customer_addr_4: "",
          customer_state: "",
          customer_country: "",
          customer_mobile_no: "",
          ShipTo_customer_name: "",
          ShipTo_customer_addr_1: "",
          ShipTocustomer_addr_2: "",
          ShipTocustomer_addr_3: "",
          ShipTocustomer_addr_4: "",
          ShipTocustomer_state: "",
          ShipTocustomer_country: "",
          ShipTocustomer_mobile_no: "",
          ShipTocontact_person: "Total",
          purchase_amount: totalPurchase,
          rounded_off: totalRoundOff,
          total_amount: totalAmount
        };

        setRowData([...newRows, totalRow]);
      } else if (response.status === 404) {
        console.log("Data Not found");
        toast.warning("Data Not found");
        setRowData([])
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const openPrintWindow = (url, headerKey, detailKey) => {
    const printWindow = window.open(url, '_blank');

    if (printWindow) {
        printWindow.addEventListener("beforeunload", () => {
            sessionStorage.removeItem(headerKey);
            sessionStorage.removeItem(detailKey);
            console.log("Session storage cleared after print window closed.");
        });
    }
};

  const handlePrint = async () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return;
    }

    const transactionNo = selectedRows[0].transaction_no;
    setLoading(true);
    try {
      const headerData = await PrintHeaderData(transactionNo);
      const detailData = await PrintDetailData(transactionNo);

      if (headerData && detailData) {
        console.log("All API calls completed successfully");

        let url, headerKey, detailKey;

        headerKey = 'DcheaderData';
        detailKey = 'DcdetailData';
        url = '/DCPrint';

        sessionStorage.setItem(headerKey, LZString.compress(JSON.stringify(headerData)));
        sessionStorage.setItem(detailKey, LZString.compress(JSON.stringify(detailData)));

        openPrintWindow(url, headerKey, detailKey);
      } else {
        console.log("Failed to fetch some data");
        toast.warning('Reference Number Does Not Exist');
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const PrintHeaderData = async (transactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/deliverychallanhdrprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo.toString() })
      });

      if (response.ok) {
        const searchData = await response.json();
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const PrintDetailData = async (transactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/deliverychallandetprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo.toString() })
      });

      if (response.ok) {
        const searchData = await response.json();
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  // const handlePrint = () => {
  //   const selectedRows = gridApi.getSelectedRows();
  //   if (selectedRows.length === 0) {
  //     toast.warning("Please select at least one row to generate a report");
  //     return;
  //   }

  //   const reportData = selectedRows.map((row) => {
  //     return {
  //       "Transaction Date": row.transaction_date,
  //       "Transaction No": row.transaction_no,
  //       "Bill to Customer Name": row.customer_name,
  //       "Bill to Customer Address": `
  //         ${row.customer_addr_1 || ''},
  //         ${row.customer_addr_2 || ''},  
  //         ${row.customer_addr_3 || ''},  
  //         ${row.customer_addr_4 || ''},<br>
  //         ${row.customer_state || ''},<br>
  //         ${row.customer_country || ''}`,
  //       "Bill to Contact Person": row.contact_person,
  //       "Bill to Mobile No": row.customer_mobile_no,
  //       "Ship to Customer Name": row.ShipTo_customer_name,
  //       "Ship to Customer Address": `
  //         ${row.ShipTo_customer_addr_1 || ''},
  //         ${row.ShipTocustomer_addr_2 || ''},  
  //         ${row.ShipTocustomer_addr_3 || ''},  
  //         ${row.ShipTocustomer_addr_4 || ''}`,
  //       "Ship to Contact Person": row.ShipTocontact_person,
  //       "Ship to Mobile No": row.ShipTocustomer_mobile_no,
  //       "Total": row.purchase_amount,
  //       "Round Off": row.rounded_off,
  //       "Grand Total": row.total_amount,
  //     };
  //   });

  //   const reportWindow = window.open("", "_blank");
  //   reportWindow.document.write("<html><head><title>Delivery Challan Analysis</title>");
  //   reportWindow.document.write("<style>");
  //   reportWindow.document.write(`
  //     body {
  //         font-family: Arial, sans-serif;
  //         margin: 20px;
  //     }
  //     h1 {
  //         color: maroon;
  //         text-align: center;
  //         font-size: 24px;
  //         margin-bottom: 30px;
  //         text-decoration: underline;
  //     }
  //     table {
  //         width: 100%;
  //         border-collapse: collapse;
  //         margin-bottom: 20px;
  //     }
  //     th, td {
  //         padding: 10px;
  //         text-align: left;
  //         border: 1px solid #ddd;
  //         vertical-align: top;
  //     }
  //     th {
  //         background-color: maroon;
  //         color: white;
  //         font-weight: bold;
  //     }
  //     td {
  //         background-color: #fdd9b5;
  //     }
  //     tr:nth-child(even) td {
  //         background-color: #fff0e1;
  //     }
  //     .report-button {
  //         display: block;
  //         width: 150px;
  //         margin: 20px auto;
  //         padding: 10px;
  //         background-color: maroon;
  //         color: white;
  //         border: none;
  //         cursor: pointer;
  //         font-size: 16px;
  //         text-align: center;
  //         border-radius: 5px;
  //     }
  //     .report-button:hover {
  //         background-color: darkred;
  //     }
  //     @media print {
  //         .report-button {
  //             display: none;
  //         }
  //         body {
  //             margin: 0;
  //             padding: 0;
  //         }
  //     }
  //   `);
  //   reportWindow.document.write("</style></head><body>");
  //   reportWindow.document.write("<h1><u>Delivery Challan Analysis</u></h1>");

  //   reportWindow.document.write("<table><thead><tr>");
  //   Object.keys(reportData[0]).forEach((key) => {
  //     reportWindow.document.write(`<th>${key}</th>`);
  //   });
  //   reportWindow.document.write("</tr></thead><tbody>");

  //   reportData.forEach((row) => {
  //     reportWindow.document.write("<tr>");
  //     Object.values(row).forEach((value) => {
  //       reportWindow.document.write(`<td>${value}</td>`);
  //     });
  //     reportWindow.document.write("</tr>");
  //   });

  //   reportWindow.document.write("</tbody></table>");

  //   reportWindow.document.write(
  //     '<button class="report-button" onclick="window.print()">Print</button>'
  //   );
  //   reportWindow.document.write("</body></html>");
  //   reportWindow.document.close();
  // };


  const transformRowData = (data) => {
    return data.map(row => ({
      "Transaction Date": row.transaction_date,
      "Transaction No": row.transaction_no,
      "Bill to Customer Name": row.customer_name.toString(),
      "Bill to Address 1": row.customer_addr_1.toString(),
      "Bill to Address 2": row.customer_addr_2.toString(),
      "Bill to Address 3": row.customer_addr_3.toString(),
      "Bill to Address 4": row.customer_addr_4.toString(),
      "Bill to State": row.customer_state.toString(),
      "Bill to Country": row.customer_country.toString(),
      "Bill to Mobile No": row.customer_mobile_no.toString(),
      "Bill to Contact Person": row.contact_person,
      "Ship to Customer Name": row.ShipTo_customer_name.toString(),
      "Ship to Address 1": row.ShipTo_customer_addr_1.toString(),
      "Ship to Address 2": row.ShipTocustomer_addr_2.toString(),
      "Ship to Address 3": row.ShipTocustomer_addr_3.toString(),
      "Ship to Address 4": row.ShipTocustomer_addr_4.toString(),
      "Ship to State": row.ShipTocustomer_state.toString(),
      "Ship to Country": row.ShipTocustomer_country.toString(),
      "Ship to Mobile No": row.ShipTocustomer_mobile_no.toString(),
      "Ship to  Contact Person": row.ShipTocontact_person.toString(),
      "Total": row.purchase_amount.toString(),
      "Round Off": row.total_amount.toString(),
      "Grand Total": row.rounded_off.toString(),
    }));
  };

  const handleExportToExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [
      ['Delivery Challan Analysis'],
      [`Company Name: ${companyName}`],
      [`Date Range: ${start_Date} to ${end_Date}`],
      []
    ];

    const transformedData = transformRowData(rowData);

    const worksheet = XLSX.utils.aoa_to_sheet(headerData);

    XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivery Challan');
    XLSX.writeFile(workbook, 'Delivery_Challan_Analysis.xlsx');
  };

  const handleCustomDatestart = (e) => {
    e.preventDefault();
    setStartDate(e.target.value);
  };

  const handleCustomDateend = (e) => {
    e.preventDefault();
    setEndDate(e.target.value);
  };

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
        <div>
          <div className="d-flex justify-content-between ">
            <div className="d-flex justify-content-start ">
              <h1 className='purbut mt-3'>Delivery Challan Analysis</h1>
            </div>
            <div className="mobileview">
              <div className="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 className='h1'>Delivery Challan Analysis</h1>
                </div>
                <div className="d-flex justify-content-end mt-4 me-5">
                  <div className="dropdown">
                    <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="fa-solid fa-list"></i>
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <icon class="iconbutton d-flex justify-content-center" onClick={handlePrint} >
                          <i className="fa-solid fa-print" ></i>
                        </icon>
                      </li>
                      <li>
                        <icon class="iconbutton d-flex justify-content-center" onClick={handleExportToExcel}>
                          <i class="fa-solid fa-file-excel"></i>
                        </icon>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="purbut">
              <div className="d-flex justify-content-end me-5">
                <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={handlePrint} title='Generate Report'>
                  <i className="fa-solid fa-print"></i>
                </button>
                <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={handleExportToExcel} title='Excel'>
                  <i class="fa-solid fa-file-excel"></i>
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="row ms-4 mt-3 mb-3 me-4">
          <div className="col-md-3 form-group">
            <label className="form-label">Select Period</label>
            <div title='Please select the period'>
            <Select
              id="wcode"
              value={selectedPeriod}
              onChange={handleChangePeriod}
              options={filteredOptionPeriod}
              className="border-secondary"
              placeholder=""
              required title="Please select a item code"
              maxLength={18}
            />
            </div>
          </div>
          {selectedPeriod.label === "Custom Date" && (
            <div className='col-md-5 mb-3'>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">From</label>
                  <input
                    type="date"
                    className="form-control border-secondary"
                    name="from"
                    value={startDate}
                    onChange={handleCustomDatestart}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">To</label>
                  <input
                    type="date"
                    className="form-control border-secondary"
                    name="to"
                    value={endDate}
                    onChange={handleCustomDateend}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="col-12 col-md-3">
            <label className="form-label">Transaction No</label>
            <input
              id="wcode"
              className="form-control exp-input-field"
              placeholder=""
              title='Please Enter the Transaction Number'
              value={transactionNo}
              onKeyDown={(e) => e.key === "Enter" && fetchDCData()}
              onChange={(e) => setTransactionNo(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Bill to Customer Name</label>
            <input
              id="wcode"
              className="form-control exp-input-field"
              placeholder=""
              title='Please Enter Bill to Customer Name'
              value={customerName}
              onKeyDown={(e) => e.key === "Enter" && fetchDCData()}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Ship to Customer Name</label>
            <input
              id="wcode"
              className="form-control exp-input-field"
              placeholder=""
              title='Please Enter Ship to Customer Name'
              value={shipToCustomerName}
              onKeyDown={(e) => e.key === "Enter" && fetchDCData()}
              onChange={(e) => setShipToCustomerName(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3 mt-2">
            <label className="form-label">Ship to Customer Address</label>
            <input
              id="wcode"
              className="form-control exp-input-field"
              placeholder=""
              title='Please Enter Ship to Customer Address'
              value={shipToCustomerAddress}
              onChange={(e) => setShipToCustomerAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDCData()}
            />
          </div>
          <div className="col-md-1">
              <div class="exp-form-floating">
                <div class=" d-flex justify-content-center mt-5">
                    <icon className="popups-btn fs-6 p-3" onClick={fetchDCData} required title="Search">
                      <i className="fas fa-search"></i>
                    </icon>
                    {/* <icon className="popups-btn fs-6 p-3" required title="Refresh">
                      <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                    </icon> */}
                </div>
              </div>
            </div>
        </div>
        <div className="ag-theme-alpine mb-4" style={{ height: 455, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationAutoPageSize={true}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </div>
  );
};

export default DCanalysis;
