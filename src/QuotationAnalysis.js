import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ItemDash.css';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import config from './Apiconfig';
import Select from 'react-select';
import { ToastContainer, toast } from "react-toastify";
import LoadingScreen from './Loading';
import LZString from "lz-string";

const QOanalysis = () => {
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
      field: "Entry_date",
    },
    {
      headerName: "Transaction No",
      field: "transaction_no",
    },
    {
      headerName: "Customer Name",
      field: "customer_name",
    },
    {
      headerName: "Address 1",
      field: "customer_addr_1",
    },
    {
      headerName: "Address 2",
      field: "customer_addr_2",
    },
    {
      headerName: "Address 3",
      field: "customer_addr_3",
    },
    {
      headerName: "Address 4",
      field: "customer_addr_4",
    },
    {
      headerName: "State",
      field: "customer_state",
    },
    {
      headerName: "Country",
      field: "customer_country",
    },
    {
      headerName: "Mobile no",
      field: "customer_mobile_no",
    },
    {
      headerName: "Contact Person",
      field: "contact_person",
    },
    {
      headerName: "Total",
      field: "purchase_amount",
    },
    {
      headerName: "Total Tax",
      field: "tax_amount",
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
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhoneNo, setCustomerPhoneNo] = useState("");
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
        fetchQuotationData();
      }
    } else if (period) {
      fetchQuotationData();
    }
  }, []);


  const fetchQuotationData = async () => {
    setLoading(true);
    try {
      const body = {
        mode: period.toString(),
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        customer_name: customerName,
        customer_addr_1: customerAddress,
        customer_mobile_no: customerPhoneNo,
        transaction_no: transactionNo,
        StartDate: selectedPeriod?.label === "Custom Date" ? startDate : undefined,
        EndDate: selectedPeriod?.label === "Custom Date" ? endDate : undefined,
      };

      const response = await fetch(`${config.apiBaseUrl}/getquotationperiod`, {
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
          Entry_date: formatDate(matchedItem.Entry_date),
          transaction_no: matchedItem.transaction_no,
          customer_name: matchedItem.customer_name,
          customer_addr_1: matchedItem.customer_addr_1,
          customer_addr_2: matchedItem.customer_addr_2,
          customer_addr_3: matchedItem.customer_addr_3,
          customer_addr_4: matchedItem.customer_addr_4,
          customer_state: matchedItem.customer_state,
          customer_country: matchedItem.customer_country,
          customer_mobile_no: matchedItem.customer_mobile_no,
          contact_person: matchedItem.contact_person,
          purchase_amount: matchedItem.purchase_amount,
          tax_amount: matchedItem.tax_amount,
          rounded_off: matchedItem.rounded_off,
          total_amount: matchedItem.total_amount,
        }));

        const totalAmount = newRows.reduce((sum, row) => sum + row.total_amount, 0);
        const totalPurchase = newRows.reduce((sum, row) => sum + row.purchase_amount, 0);
        const totalTax = newRows.reduce((sum, row) => sum + row.tax_amount, 0);
        const totalRoundOff = newRows.reduce((sum, row) => sum + row.rounded_off, 0);

        const totalRow = {
          Entry_date: "",
          transaction_no: "",
          customer_name: "",
          customer_addr_1: "",
          customer_addr_2: "",
          customer_addr_3: "",
          customer_addr_4: "",
          customer_state: "",
          customer_country: "",
          customer_mobile_no: "",
          contact_person: "Total",
          purchase_amount: totalPurchase,
          tax_amount: totalTax,
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

  const PrintHeaderData = async (transactionNo) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/refNumberToQuotationHeaderPrintData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
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
      const response = await fetch(
        `${config.apiBaseUrl}/refNumberToQuotationDetailPrintData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log("Data received:", searchData);
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const PrintSumTax = async (transactionNo) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/refNumberToQuoteSumTax`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo.toString() }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
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

  const openPrintWindow = (url, headerKey, detailKey, taxKey) => {
    const printWindow = window.open(url, '_blank');

    if (printWindow) {
      printWindow.addEventListener("beforeunload", () => {
        sessionStorage.removeItem(headerKey);
        sessionStorage.removeItem(detailKey);
        sessionStorage.removeItem(taxKey);
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
      const taxData = await PrintSumTax(transactionNo);

      if (headerData && detailData && taxData) {

        let url, headerKey, detailKey, taxKey;

        headerKey = 'QuotationheaderData';
        detailKey = 'QuotationdetailData';
        taxKey = 'QuotationtaxData';
        url = '/QuotationPrint';

        sessionStorage.setItem(headerKey, LZString.compress(JSON.stringify(headerData)));
        sessionStorage.setItem(detailKey, LZString.compress(JSON.stringify(detailData)));
        sessionStorage.setItem(taxKey, LZString.compress(JSON.stringify(taxData)));

        openPrintWindow(url, headerKey, detailKey, taxKey);
      } else {
        console.log("Failed to fetch some data");
        toast.error("Transaction No Does Not Exits");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    } finally {
      setLoading(false);
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
  //       "Transaction Date": row.Entry_date,
  //       "Transaction No": row.transaction_no,
  //       "Customer Name": row.customer_name,
  //       "Customer Address": `
  //         ${row.customer_addr_1 || ''},
  //         ${row.customer_addr_2 || ''},  
  //         ${row.customer_addr_3 || ''},  
  //         ${row.customer_addr_4 || ''},<br>
  //         ${row.customer_state || ''},<br>
  //         ${row.customer_country || ''}`,
  //       "Contact Person": row.contact_person,
  //       "Mobile No": row.customer_mobile_no,
  //       "Total": row.purchase_amount,
  //       "Total Tax": row.tax_amount,
  //       "Round Off": row.rounded_off,
  //       "Grand Total": row.total_amount,
  //     };
  //   });

  //   const reportWindow = window.open("", "_blank");
  //   reportWindow.document.write("<html><head><title>Quotation Analysis</title>");
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
  //   reportWindow.document.write("<h1><u>Quotation Analysis</u></h1>");

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
      "Transaction Date": row.Entry_date,
      "Transaction No": row.transaction_no,
      "Bill to Customer Name": row.customer_name.toString(),
      "Bill to Address 1": row.customer_addr_1.toString(),
      "Bill to Address 2": row.customer_addr_2.toString(),
      "Bill to Address 3": row.customer_addr_3.toString(),
      "Bill to Address 4": row.customer_addr_4.toString(),
      "Bill to State": row.customer_state.toString(),
      "Bill to Country": row.customer_country.toString(),
      "Bill to Mobile No": row.customer_mobile_no.toString(),
      "Bill to Contact per": row.contact_person.toString(),
      "Total": row.purchase_amount.toString(),
      "Total Tax": row.tax_amount.toString(),
      "Round Off": row.rounded_off.toString(),
      "Grand Total": row.total_amount.toString(),
    }));
  };

  const handleExportToExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [
      ['Quotation Analysis'],
      [`Company Name: ${companyName}`],
      [`Date Range: ${start_Date} to ${end_Date}`],
      []
    ];

    const transformedData = transformRowData(rowData);

    const worksheet = XLSX.utils.aoa_to_sheet(headerData);

    XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quotation');
    XLSX.writeFile(workbook, 'Quotation_Analysis.xlsx');
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
              <h1 className='purbut mt-3'>Quotation Analysis</h1>
            </div>
            <div className="mobileview">
              <div className="d-flex justify-content-between ">
                <div className="d-flex justify-content-start ">
                  <h1 className='h1'>Quotation Analysis</h1>
                </div>
                <div className="dropdown mt-3 me-4">
                  <button className="btn btn-primary dropdown-toggle p-1 " type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa-solid fa-list"></i>
                  </button>
                  <ul className="dropdown-menu ">
                    <li>
                      <icon class="iconbutton d-flex justify-content-center " onClick={handlePrint}>
                        <i className="fa-solid fa-print"></i>
                      </icon>
                    </li>
                    <li>
                      <icon class="iconbutton d-flex justify-content-center " onClick={handleExportToExcel}>
                        <i class="fa-solid fa-file-excel"></i>
                      </icon>
                    </li>
                  </ul>
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
                    className="form-control exp-input-field"
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
              onKeyDown={(e) => e.key === "Enter" && fetchQuotationData()}
              onChange={(e) => setTransactionNo(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Customer Name</label>
            <input
              id="wcode"
              className="form-control exp-input-field"
              placeholder=""
              title='Please Enter the Customer Name'
              value={customerName}
              onKeyDown={(e) => e.key === "Enter" && fetchQuotationData()}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Customer Address</label>
            <input
              id="wcode"
              className="form-control exp-input-field"
              placeholder=""
              title='Please Enter the Customer Address'
              value={customerAddress}
              onKeyDown={(e) => e.key === "Enter" && fetchQuotationData()}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3 mt-2">
            <label className="form-label">Customer Phone No</label>
            <input
              id="wcode"
              className="form-control exp-input-field"
              placeholder=""
              title='Please Enter the Customer Phone Number'
              value={customerPhoneNo}
              onKeyDown={(e) => e.key === "Enter" && fetchQuotationData()}
              onChange={(e) => setCustomerPhoneNo(e.target.value)}
            />
          </div>
          <div className="col-md-1">
              <div class="exp-form-floating">
                <div class=" d-flex justify-content-center mt-5">
                    <icon className="popups-btn fs-6 p-3" onClick={fetchQuotationData} required title="Search">
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

export default QOanalysis;
