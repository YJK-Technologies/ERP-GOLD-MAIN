import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ItemDash.css';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';
import config from './Apiconfig';
import { ToastContainer, toast } from "react-toastify";
import LoadingScreen from './Loading';
import LZString from "lz-string";

const TaxInvoiceanalysis = () => {
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
      field: "bill_date",
    },
    {
      headerName: "Transaction No",
      field: "bill_no",
    },
    {
      headerName: "Bill to Customer Name",
      field: "billTo_customer_name",
    },
    {
      headerName: "Bill to Address 1",
      field: "billTo_customer_addr_1",
    },
    {
      headerName: "Bill to Address 2",
      field: "billTo_customer_addr_2",
    },
    {
      headerName: "Bill to Address 3",
      field: "billTo_customer_addr_3",
    },
    {
      headerName: "Bill to Address 4",
      field: "billTo_customer_addr_4",
    },
    {
      headerName: "Bill to Contact Person",
      field: "billTo_contact_person",
    },
    {
      headerName: "Bill to Customer State",
      field: "billTo_customer_state",
    },
    {
      headerName: "Bill to Customer Country",
      field: "billTo_customer_country",
    },
    {
      headerName: "Bill to Customer Mobile No",
      field: "billTo_customer_mobile_no",
    },
    {
      headerName: "Ship to Customer Name",
      field: "shipTo_customer_name",
    },
    {
      headerName: "Ship to Address 1",
      field: "shipTo_customer_addr_1",
    },
    {
      headerName: "Ship to Address 2",
      field: "shipTo_customer_addr_2",
    },
    {
      headerName: "Ship to Address 3",
      field: "shipTo_customer_addr_3",
    },
    {
      headerName: "Ship to Address 4",
      field: "shipTo_customer_addr_4",
    },
    {
      headerName: "Ship to Contact Person",
      field: "shipTo_contact_person",
    },
    {
      headerName: "Ship to Customer State",
      field: "shipTo_customer_state",
    },
    {
      headerName: "Ship to Customer Country",
      field: "shipTo_customer_country",
    },
    {
      headerName: "Ship to Customer Mobile No",
      field: "shipTo_customer_mobile_no",
    },
    {
      headerName: "Total",
      field: "sale_amt",
    },
    {
      headerName: "Total Tax",
      field: "tax_amount",
    },
    {
      headerName: "Round Off",
      field: "roff_amt",
    },
    {
      headerName: "Grand Total",
      field: "bill_amt",
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
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [invoicedrop, setInvoicedrop] = useState([]);
  const [selectedInvoice, setselectedInvoice] = useState(null);
  const [invoicetype, setInvoiceType] = useState("");
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


    fetch(`${config.apiBaseUrl}/getInvocieType`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setInvoicedrop(data);
        const defaultInvoice = data.find((item) => item.attributedetails_name === "Tax Invoice") || data[0];
        if (defaultInvoice) {
          setselectedInvoice({
            value: defaultInvoice.attributedetails_name,
            label: defaultInvoice.attributedetails_name,
          });
          setInvoiceType(defaultInvoice.attributedetails_name);
        }
      })
      .catch((error) => console.error("Error fetching invoice types:", error));
  }, []);

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange((prevRange) => ({
      ...prevRange,
      [name]: value
    }));
  };

  const filteredOptionInvoice = invoicedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeInvoice = (selectedOption) => {
    setselectedInvoice(selectedOption);
    setInvoiceType(selectedOption ? selectedOption.value : '');
  };


  useEffect(() => {
    if (selectedPeriod?.label === "Custom Date") {
      if (startDate && endDate) {
        fetchDCData();
      }
    } else if (period && invoicetype) {
      fetchDCData();
    }
  }, []);

  const fetchDCData = async () => {
    setLoading(true);
    try {
      const body = {
        mode: period.toString(),
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        Type: invoicetype,
        bill_no: transactionNo,
        billTo_customer_name: customerName,
        shipTo_customer_name: shipToCustomerName,
        ShipTo_customer_addr_1: shipToCustomerAddress,
        StartDate: selectedPeriod?.label === "Custom Date" ? startDate : undefined,
        EndDate: selectedPeriod?.label === "Custom Date" ? endDate : undefined,
      };

      const response = await fetch(`${config.apiBaseUrl}/getTaxInvoicePeriod`, {
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
          bill_date: formatDate(matchedItem.bill_date),
          bill_no: matchedItem.bill_no,
          billTo_customer_name: matchedItem.billTo_customer_name,
          billTo_customer_addr_1: matchedItem.billTo_customer_addr_1,
          billTo_customer_addr_2: matchedItem.billTo_customer_addr_2,
          billTo_customer_addr_3: matchedItem.billTo_customer_addr_3,
          billTo_customer_addr_4: matchedItem.billTo_customer_addr_4,
          billTo_contact_person: matchedItem.billTo_contact_person,
          billTo_customer_state: matchedItem.billTo_customer_state,
          billTo_customer_country: matchedItem.billTo_customer_country,
          billTo_customer_mobile_no: matchedItem.billTo_customer_mobile_no,
          shipTo_customer_name: matchedItem.shipTo_customer_name,
          shipTo_customer_addr_1: matchedItem.shipTo_customer_addr_1,
          shipTo_customer_addr_2: matchedItem.shipTo_customer_addr_2,
          shipTo_customer_addr_3: matchedItem.shipTo_customer_addr_3,
          shipTo_customer_addr_4: matchedItem.shipTo_customer_addr_4,
          shipTo_contact_person: matchedItem.shipTo_contact_person,
          shipTo_customer_state: matchedItem.shipTo_customer_state,
          shipTo_customer_country: matchedItem.shipTo_customer_country,
          shipTo_customer_mobile_no: matchedItem.shipTo_customer_mobile_no,
          sale_amt: matchedItem.sale_amt,
          tax_amount: matchedItem.tax_amount,
          roff_amt: matchedItem.roff_amt,
          bill_amt: matchedItem.bill_amt,
        }));
        
        const totalAmount = newRows.reduce((sum, row) => sum + row.bill_amt, 0);
        const totalSales = newRows.reduce((sum, row) => sum + row.sale_amt, 0);
        const totalTax = newRows.reduce((sum, row) => sum + row.tax_amount, 0);
        const totalRoundOff = newRows.reduce((sum, row) => sum + row.roff_amt, 0);

        const totalRow = {
          bill_date: "",
          bill_no: "",
          billTo_customer_name: "",
          billTo_customer_addr_1: "",
          billTo_customer_addr_2: "",
          billTo_customer_addr_3: "",
          billTo_customer_addr_4: "",
          billTo_contact_person: "",
          billTo_customer_state: "",
          billTo_customer_country: "",
          billTo_customer_mobile_no: "",
          shipTo_customer_name: "",
          shipTo_customer_addr_1: "",
          shipTo_customer_addr_2: "",
          shipTo_customer_addr_3: "",
          shipTo_customer_addr_4: "",
          shipTo_contact_person: "",
          shipTo_customer_state: "",
          shipTo_customer_country: "",
          shipTo_customer_mobile_no: "Total",
          sale_amt: totalSales,
          tax_amount: totalTax,
          roff_amt: totalRoundOff,
          bill_amt: totalAmount
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

  const PrintHeaderData = async (transactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/TaxInvocieHdrPrint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo, invoice_type: invoicetype })
      });

      if (response.ok) {
        const searchData = await response.json();
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

  const PrintDetailData = async (transactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/TaxInvocieDetPrint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo, invoice_type: invoicetype })
      });

      if (response.ok) {
        const searchData = await response.json();
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
      const response = await fetch(`${config.apiBaseUrl}/taxinvoicetaxprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo, invoice_type: invoicetype })
      });

      if (response.ok) {
        const searchData = await response.json();
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

  const openPrintWindow = (url, headerKey, detailKey, taxKey) => {
    const openWindow = (targetUrl) => {
        const printWindow = window.open(targetUrl, '_blank');
        if (printWindow) {
            printWindow.addEventListener("beforeunload", () => {
                sessionStorage.removeItem(headerKey);
                sessionStorage.removeItem(detailKey);
                sessionStorage.removeItem(taxKey);
                console.log("Session storage cleared after print window closed.");
            });
        }
    };

    if (url === '/TaxInvoicePrint') {
        for (let i = 1; i <= 3; i++) {
            openWindow(`${url}?page=${i}`);
        }
    } else {
        openWindow(url);
    }
};

  const handlePrint = async () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return;
    }

    const transactionNo = selectedRows[0].bill_no;
    setLoading(true);

    if (invoicetype === "Tax Invoice"){
      setLoading(true);
      try {
        const headerData = await PrintHeaderData(transactionNo);
        const detailData = await PrintDetailData(transactionNo);
        const taxData = await PrintSumTax(transactionNo);

        if (headerData && detailData && taxData) {
          console.log("All API calls completed successfully");
          let url, headerKey, detailKey, taxKey;
          headerKey = 'TaxInvoiceheaderData';
          detailKey = 'TaxInvoicedetailData';
          taxKey = 'TaxInvoicetaxData';
          url = '/TaxInvoicePrint';

          sessionStorage.setItem(headerKey, LZString.compress(JSON.stringify(headerData)));
          sessionStorage.setItem(detailKey, LZString.compress(JSON.stringify(detailData)));
          sessionStorage.setItem(taxKey, LZString.compress(JSON.stringify(taxData)));
          openPrintWindow(url, headerKey, detailKey, taxKey);
        } else {
          console.log("Failed to fetch some data");
          toast.error("Transaction Number Does Not Exits");
        }
      } catch (error) {
        console.error("Error executing API calls:", error);
      } finally {
        setLoading(false);
      }
    }
    else if (invoicetype === "Performa Invoice"){
      setLoading(true);
      try {
        const headerData = await PrintHeaderData(transactionNo);
        const detailData = await PrintDetailData(transactionNo);
        const taxData = await PrintSumTax(transactionNo);

        if (headerData && detailData && taxData) {
          console.log("All API calls completed successfully");
          let url, headerKey, detailKey, taxKey;

          headerKey = 'PerformaInvoiceheaderData';
          detailKey = 'PerformaInvoicedetailData';
          taxKey = 'PerformaInvoicetaxData';
          url = '/PerformaInvoicePrint';

          sessionStorage.setItem(headerKey, LZString.compress(JSON.stringify(headerData)));
          sessionStorage.setItem(detailKey, LZString.compress(JSON.stringify(detailData)));
          sessionStorage.setItem(taxKey, LZString.compress(JSON.stringify(taxData)));
        } else {
          console.log("Failed to fetch some data");
          toast.error("Transaction Number Does Not Exits");
        }
      } catch (error) {
        console.error("Error executing API calls:", error);
      } finally {
        setLoading(false);
      }
    }
    else {
      toast.error("Transaction Number Does Not Exits");
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };


  // const handlePrints = () => {
  //   const selectedRows = gridApi.getSelectedRows();
  //   if (selectedRows.length === 0) {
  //     alert("Please select at least one row to generate a report");
  //     return;
  //   }

  //   const reportData = selectedRows.map((row) => {
  //     return {
  //       "Transaction Date": row.bill_date,
  //       "Transaction No": row.bill_no,
  //       "Bill to Customer Name": row.billTo_customer_name,
  //       "Bill to Customer Address": `
  //         ${row.billTo_customer_addr_1 || ''},
  //         ${row.billTo_customer_addr_2 || ''},  
  //         ${row.billTo_customer_addr_3 || ''},  
  //         ${row.billTo_customer_addr_4 || ''},<br>
  //         ${row.billTo_customer_state || ''},<br>
  //         ${row.billTo_customer_country || ''}`,
  //       "Bill to Contact Person": row.billTo_contact_person,
  //       "Bill to Mobile No": row.billTo_customer_mobile_no,
  //       "Ship to Customer Name": row.shipTo_customer_name,
  //       "Ship to Customer Address": `
  //         ${row.shipTo_customer_addr_1 || ''},
  //         ${row.shipTo_customer_addr_2 || ''},  
  //         ${row.shipTo_customer_addr_3 || ''},  
  //         ${row.shipTo_customer_addr_4 || ''},<br>
  //         ${row.shipTo_customer_state || ''},<br>
  //         ${row.shipTo_customer_country || ''}`,
  //       "Ship to Contact Person": row.shipTo_contact_person,
  //       "Ship to Mobile No": row.shipTo_customer_mobile_no,
  //       "Total": row.sale_amt,
  //       "Total Tax": row.tax_amount,
  //       "Round Off": row.roff_amt,
  //       "Grand Total": row.bill_amt,
  //     };
  //   });

  //   const reportWindow = window.open("", "_blank");
  //   reportWindow.document.write("<html><head><title>Tax Invoice Analysis</title>");
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
  //   reportWindow.document.write("<h1><u>Tax Invoice Analysis</u></h1>");

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
      "Transaction Date": row.bill_date,
      "Transaction No": row.bill_no,
      "Bill to Customer Name": row.billTo_customer_name.toString(),
      "Bill to Address 1": row.billTo_customer_addr_1.toString(),
      "Bill to Address 2": row.billTo_customer_addr_2.toString(),
      "Bill to Address 3": row.billTo_customer_addr_3.toString(),
      "Bill to Address 4": row.billTo_customer_addr_4.toString(),
      "Bill to State": row.billTo_customer_state.toString(),
      "Bill to Country": row.billTo_customer_country.toString(),
      "Bill to Mobile No": row.billTo_customer_mobile_no.toString(),
      "Bill to Contact Person": row.billTo_contact_person.toString(),
      "Ship to Customer Name": row.shipTo_customer_name.toString(),
      "Ship to Address 1": row.shipTo_customer_addr_1.toString(),
      "Ship to Address 2": row.shipTo_customer_addr_2.toString(),
      "Ship to Address 3": row.shipTo_customer_addr_3.toString(),
      "Ship to Address 4": row.shipTo_customer_addr_4.toString(),
      "Ship to State": row.shipTo_customer_state.toString(),
      "Ship to Country": row.shipTo_customer_country.toString(),
      "Ship to Mobile no": row.shipTo_customer_mobile_no.toString(),
      "Ship to Contact Person": row.shipTo_contact_person.toString(),
      "Total": row.sale_amt.toString(),
      "Total Tax": row.tax_amount.toString(),
      "Round Off": row.roff_amt.toString(),
      "Grand Total": row.bill_amt.toString(),
    }));
  };

  const handleExportToExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [
      ['Invoice Analysis'],
      [`Company Name: ${companyName}`],
      [`Date Range: ${start_Date} to ${end_Date}`],
      []
    ];

    const transformedData = transformRowData(rowData);

    const worksheet = XLSX.utils.aoa_to_sheet(headerData);

    XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice');
    XLSX.writeFile(workbook, 'Invoice_Analysis.xlsx');
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
            <div><h1 className='purbut mt-3'>Invoice Analysis</h1></div>
            <div className="mobileview">
              <div className="d-flex justify-content-between ">
                <div className='d-flex justify-content-start'>
                  <h1 className='h1'>Invoice Analysis</h1>
                </div>
                <div className='d-flex justify-content-end mt-3 me-4 '>
                  <div className="dropdown1">
                    <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
            <div title='Please Enter the Select Period'>
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
              onKeyDown={(e) => e.key === "Enter" && fetchDCData()}
              onChange={(e) => setShipToCustomerAddress(e.target.value)}
            // onKeyDown={(e) => e.key === "Enter" && fetchDCData()}
            />
          </div>
          <div className="col-12 col-md-3 mt-2">
            <label className="form-label">Invoice Type</label>
            <div title='Please Enter Invoice Type'>
            <Select
              id="InvoiceType"
              className="exp-input-field"
              placeholder="Select a Invoice Type  "
              options={filteredOptionInvoice}
              value={selectedInvoice}
              onKeyDown={(e) => e.key === "Enter" && fetchDCData()}
              onChange={handleChangeInvoice}
            />
            </div>
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

export default TaxInvoiceanalysis;
