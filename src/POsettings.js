import React, { useState, useEffect } from 'react';

import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

const POsettings = () => {


    const [Type, setType] = useState("PurchaseOrder");
    const [selectedParty, setSelectedParty] = useState(null);
    const [party, setParty] = useState(null);
    const [partyDrop, setPartyDrop] = useState([]);
    const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

    const handleChangeParty = (selectedParty) => {
        setSelectedParty(selectedParty);
        const selectedValue = selectedParty ? selectedParty.value : "";
        setParty(selectedValue);

    };



    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getGSTReport`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_code: sessionStorage.getItem("selectedCompanyCode"),
            }),
          })             .then((response) => response.json())
            .then((data) => {
                setPartyDrop(data);
                const defaultParty = data.find((item) => item.descriptions === "Customer") || data[0];
                if (defaultParty) {
                    setSelectedParty({
                        value: defaultParty.descriptions,
                        label: defaultParty.descriptions,
                    });
                    setParty(defaultParty.descriptions);
                }
            })
            .catch((error) => console.error("Error fetching invoice types:", error));
    }, []);

    const filteredOptionParty = Array.isArray(partyDrop)
        ? partyDrop.map((option) => ({
            value: option.descriptions,
            label: option.descriptions,
        }))
        : [];



    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getDefaultoptions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode"),
                Screen_Type: Type

            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data || data.length === 0) return;

                const { Shiping_to } = data[0];

                const setDefault = (type, setType, options, setSelected) => {
                    if (type) {
                        setType(type);
                        setSelected(options.find((opt) => opt.value === type) || null);
                    }
                };


                setDefault(Shiping_to, setParty, filteredOptionParty, setSelectedParty);



            })
            .catch((error) => console.error("Error fetching data:", error));
    }, [partyDrop]);



    const handleSaveButtonClick = async () => {
        if (!party) {
            toast.warning('Error: Missing required fields');
            return;
        }
        
    setLoading(true);

        try {
            const Header = {
                company_code: sessionStorage.getItem('selectedCompanyCode'),

                Screen_Type: Type,
                Shiping_to: party,
                created_by: sessionStorage.getItem('selectedUserCode')
            };
            const response = await fetch(`${config.apiBaseUrl}/AddTransactionSettinngs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Header),
            });

            if (response.ok) {
                toast.success("Data inserted Successfully");
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to insert sales data");
                console.error(errorResponse.details || errorResponse.message);
            }
        } catch (error) {
            console.error("Error inserting data:", error);
            toast.error("Error inserting data: " + error.message);
        }finally {
      setLoading(false);
    }

    };


    const handleNavigate = () => {
        navigate("/PurchaseOrder"); // Pass selectedRows as props to the Input component
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div className="shadow-lg p-0 bg-body-tertiary rounded  ">
                <div className=" mb-0 d-flex justify-content-between" >
                    <label className="fw-bold fs-5">Default  Settings: </label>
                    <button onClick={handleNavigate} className=" btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <div class="pt-2 mb-4">
                <div className="shadow-lg p-3 bg-body-tertiary rounded  mb-2">
                    <div className="row  ms-3 me-3">
                        <div className="col-md-3 form-group mb-2" >
                            <div class="exp-form-floating" >
                                <label for="">Ship To</label>
                                <Select
                                    id="status"
                                    value={selectedParty}
                                    onChange={handleChangeParty}
                                    options={filteredOptionParty}
                                    className="exp-input-field"
                                    placeholder=""
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2" style={{ display: "none" }}>
                            <div className="exp-form-floating">
                                <label id="customer">Screen Type</label>
                                <input
                                    className="exp-input-field form-control"
                                    id="customername"
                                    required
                                    value={Type}
                                    onChange={(e) => setType(e.target.value)}
                                />
                            </div>
                        </div>

                        <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                            <button className="" onClick={handleSaveButtonClick} title="Save">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    );
};

export default POsettings;
