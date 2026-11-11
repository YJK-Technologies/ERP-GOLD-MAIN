// GroupMasterInput.js
import React, { useState, useEffect, useRef } from "react";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import LoadingScreen from "./Loading";

const config = require("./Apiconfig");

function GroupMasterInput({}) {
  const [group_type, setgroup_type] = useState("");
  const [group_name, setgroup_name] = useState("");
  const [account_code, setaccount_code] = useState("");
  
  const [selectedGroupType, setSelectedGroupType] = useState(null);
  const [group_typedrop, setgroup_typedrop] = useState([]);
  
  // New States for Group Name Select
  const [selectedGroupName, setSelectedGroupName] = useState(null);
  const [groupNameOptions, setGroupNameOptions] = useState([]);

  // Status States
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [status, setStatus] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  // Refs for Enter key navigation
  const groupTypeRef = useRef(null);
  const groupNameRef = useRef(null);
  const accountCodeRef = useRef(null);
  const locationCodeRef = useRef(null);
  const statusRef = useRef(null);

  const created_by = sessionStorage.getItem("selectedUserCode");
  const modified_by = sessionStorage.getItem("selectedUserCode");
  const company_code = sessionStorage.getItem("selectedCompanyCode");
  const location_code =sessionStorage.getItem("selectedLocationCode");

  const [isUpdated, setIsUpdated] = useState(false);
  const [keyfield, setKeyfield] = useState("");
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  const clearInputFields = () => {
    setgroup_type("");
    setSelectedGroupType(null);
    setgroup_name("");
    setSelectedGroupName(null);
    setGroupNameOptions([]);
    setaccount_code("");
    setSelectedStatus(null);
    setStatus("");
    setKeyfield("");
  };

  // Fetch Status Options
  useEffect(() => {
    if (company_code) {
      fetch(`${config.apiBaseUrl}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_code }),
      })
        .then((data) => data.json())
        .then((val) => setStatusdrop(val))
        .catch((error) => console.error("Error fetching status:", error));
    }
  }, [company_code]);

  // Fetch Group Type Options
  useEffect(() => {
    if (company_code) {
      fetch(`${config.apiBaseUrl}/getGroupTypeCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_code }),
      })
        .then((data) => data.json())
        .then((val) => setgroup_typedrop(val))
        .catch((error) => console.error("Error fetching group types:", error));
    }
  }, [company_code]);

  // Function to fetch Group Names based on selected Group Type
  const fetchGroupNames = async (type) => {
    if (!type || !company_code) return;
    
    let endpoint = "";
    if (type === "Customer Group") {
      endpoint = "/CustomerGroupCode";
    } else if (type === "Item Group") {
      endpoint = "/ItemGroupCode";
    } else if (type === "Vendor Group") {
      endpoint = "/VendorGroupCode";
    }

    if (endpoint) {
      try {
        const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_code }),
        });
        const data = await response.json();
        const options = data.map((option) => ({
          value: option.attributedetails_name,
          label: option.attributedetails_name,
        }));
        setGroupNameOptions(options);
      } catch (error) {
        console.error("Error fetching group names:", error);
      }
    } else {
      setGroupNameOptions([]);
    }
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setKeyfield(selectedRow.keyfield || "");
      
      const rowGroupType = selectedRow.group_type || "";
      setgroup_type(rowGroupType);
      setSelectedGroupType({
        label: rowGroupType,
        value: rowGroupType,
      });

      const rowGroupName = selectedRow.group_name || "";
      setgroup_name(rowGroupName);
      setSelectedGroupName({
        label: rowGroupName,
        value: rowGroupName,
      });

      setaccount_code(selectedRow.account_code || "");
      
      const rowStatus = selectedRow.status || "";
      setSelectedStatus({
        label: rowStatus,
        value: rowStatus,
      });
      setStatus(rowStatus);

      // Fetch group name options for update mode
      if (rowGroupType) {
        fetchGroupNames(rowGroupType);
      }
    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  const filteredOptionGroupType = group_typedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionStatus = statusdrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }));

  const handleChangeGroupType = (selectedOption) => {
    setSelectedGroupType(selectedOption);
    const newType = selectedOption ? selectedOption.value : "";
    setgroup_type(newType);
    
    // Clear dependent Group Name field when Group Type changes
    setSelectedGroupName(null);
    setgroup_name("");
    setGroupNameOptions([]);

    // Fetch related Group Names
    fetchGroupNames(newType);
  };

  const handleChangeGroupName = (selectedOption) => {
    setSelectedGroupName(selectedOption);
    setgroup_name(selectedOption ? selectedOption.value : "");
  };

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : "");
  };

  const handleInsert = async () => {
    if (!group_type || !group_name || !status) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addGroupMaster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code,
          group_type,
          group_name,
          account_code,
          location_code,
          status, 
          created_by,
        }),
      });

      if (response.ok) {
        toast.success("Data inserted Successfully", {
          onClose: () => clearInputFields(),
        });
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!group_type || !group_name || !status) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    const editedRow = {
      company_code,
      group_type,
      group_name,
      account_code,
      location_code,
      status, 
      keyfield,
      modified_by,
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/saveEditedGroupMaster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "modified-by": modified_by
        },
        body: JSON.stringify({ editedData: [editedRow] }), 
      });
      
      if (response.ok) {
        toast.success("Data Updated Successfully");
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error Update data:", error);
      toast.error("Error Update data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    navigate("/GroupMasterGrid", {
      state: {
        preservedRowData: location.state?.preservedRowData,
        preservedInputs: location.state?.preservedInputs,
      },
    });
  };

  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      } else if (mode === "create") {
        handleInsert();
      } else {
        handleUpdate();
      }
    }
  };

  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class="">
          {loading && <LoadingScreen />}
          <ToastContainer
            position="top-right"
            className="toast-design"
            theme="colored"
          />
          <div class="row ">
            <div class="">
              <div></div>
              <div>
                <div>
                  <div className="shadow-lg p-0 bg-body-tertiary rounded">
                    <div className="mb-0 d-flex justify-content-between">
                      <h1 align="left" class="purbut ">
                        {mode === "update"
                          ? "Update Group Master"
                          : "Add Group Master"}
                      </h1>
                      <h1 align="left" class="mobileview fs-4">
                        {mode === "update"
                          ? "Update Group Master"
                          : "Add Group Master"}
                      </h1>
                      <button
                        onClick={handleNavigate}
                        className=" btn btn-danger shadow-none rounded-0 h-70 fs-5"
                        required
                        title="Close"
                      >
                        <i class="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="pt-2 mb-4">
              <div className="shadow-lg p-3 bg-body-tertiary rounded  mb-2">
                <div class="row">
                  
                  {/* Group Type Select */}
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label
                            for="gtype"
                            class="exp-form-labels"
                            className={`${error && !group_type ? "text-danger" : ""}`}
                          >
                            Group Type<span className="text-danger">*</span>
                          </label>
                        </div>
                      </div>
                      <div title="Select Group Type">
                        <Select
                          id="gtype"
                          value={selectedGroupType}
                          onChange={handleChangeGroupType}
                          options={filteredOptionGroupType}
                          className="exp-input-field"
                          placeholder=""
                          ref={groupTypeRef}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (groupNameRef.current) {
                                groupNameRef.current.focus();
                              }
                            }
                          }}
                          classNamePrefix="react-select"
                          styles={{menu: (provided) => ({ ...provided, zIndex: 9999 })}}
                          isClearable
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Cascading Group Name Select */}
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label
                            for="gname"
                            class="exp-form-labels"
                            className={`${error && !group_name ? "text-danger" : ""}`}
                          >
                            Group Name<span className="text-danger">*</span>
                          </label>
                        </div>
                      </div>
                      <div title="Select Group Name">
                        <Select
                          id="gname"
                          value={selectedGroupName}
                          onChange={handleChangeGroupName}
                          options={groupNameOptions}
                          className="exp-input-field"
                          placeholder=""
                          ref={groupNameRef}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (accountCodeRef.current) {
                                accountCodeRef.current.focus();
                              }
                            }
                          }}
                          classNamePrefix="react-select"
                          styles={{menu: (provided) => ({ ...provided, zIndex: 9999 })}}
                          isClearable
                          isDisabled={!group_type}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label for="acode" class="exp-form-labels">
                            Account Code
                          </label>
                        </div>
                      </div>
                      <input
                        id="acode"
                        className="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        title="Please fill the Account Code here"
                        value={account_code}
                        onChange={(e) => setaccount_code(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, locationCodeRef)}
                        ref={accountCodeRef}
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label for="status" class="exp-form-labels"
                            className={`${error && !status ? "text-danger" : ""}`}>
                            Status<span className="text-danger">*</span>
                          </label>
                        </div>
                      </div>
                      <div title="Select the Status">
                        <Select
                          id="status"
                          value={selectedStatus}
                          onChange={handleChangeStatus}
                          options={filteredOptionStatus}
                          className="exp-input-field"
                          placeholder=""
                          ref={statusRef}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (mode === "create") {
                                handleInsert();
                              } else {
                                handleUpdate();
                              }
                            }
                          }}
                          classNamePrefix="react-select"
                          styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                    {mode === "create" ? (
                      <button onClick={handleInsert} className="" title="Save">
                        <i class="fa-solid fa-floppy-disk"></i>
                      </button>
                    ) : (
                      <button
                        onClick={handleUpdate}
                        className=""
                        title="Update"
                      >
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupMasterInput;