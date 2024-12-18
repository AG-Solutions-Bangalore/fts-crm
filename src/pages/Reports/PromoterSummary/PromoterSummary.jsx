import React, { useEffect, useState } from "react";
import Layout from "../../../layout/Layout";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/common/PageTitle";
import { Input, Button, Card } from "@material-tailwind/react";
import Dropdown from "../../../components/common/DropDown";
import moment from "moment";
import BASE_URL from "../../../base/BaseUrl";
import { toast } from "react-toastify";
import axios from "axios";
import Fields from "../../../common/TextField/TextField";

const PromterSummary = () => {
  const navigate = useNavigate();
  const [promoter, setPromoters] = useState([]);
  const todayback = moment().format("YYYY-MM-DD");
  const firstdate = moment().startOf("month").format("YYYY-MM-DD");
  const [downloadDonor, setDonorDownload] = useState({
    receipt_from_date: firstdate,
    receipt_to_date: todayback,
    indicomp_promoter: "",
  });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    const updatedDonor = {
      ...downloadDonor,
      [name]: value,
    };
    setDonorDownload(updatedDonor);
    checkIfButtonShouldBeEnabled(updatedDonor);
  };

  const checkIfButtonShouldBeEnabled = (data) => {
    const { receipt_from_date, receipt_to_date, indicomp_promoter } = data;
    if (receipt_from_date && receipt_to_date && indicomp_promoter) {
      setIsButtonEnabled(true);
    } else {
      setIsButtonEnabled(false);
    }
  };

  const onReportView = (e) => {
    e.preventDefault();
    if (document.getElementById("dowRecp").checkValidity()) {
      const { receipt_from_date, receipt_to_date, indicomp_promoter } =
        downloadDonor;
      localStorage.setItem("receipt_from_date_prm", receipt_from_date);
      localStorage.setItem("receipt_to_date_prm", receipt_to_date);
      localStorage.setItem("indicomp_full_name_prm", indicomp_promoter);
      navigate("/d-summary-view");
    }
  };

  useEffect(() => {
    const theLoginToken = localStorage.getItem("token");
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + theLoginToken,
      },
    };

    fetch(BASE_URL + "/api/fetch-promoter", requestOptions)
      .then((response) => response.json())
      .then((data) => setPromoters(data.promoter));
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    let data = {
      indicomp_promoter: downloadDonor.indicomp_promoter,
      receipt_from_date: downloadDonor.receipt_from_date,
      receipt_to_date: downloadDonor.receipt_to_date,
    };

    if (document.getElementById("dowRecp").reportValidity()) {
      axios({
        url: BASE_URL + "/api/download-promoter-summary",
        method: "POST",
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "promoter_summary.csv");
          document.body.appendChild(link);
          link.click();
          toast.success("Promoter Summary is Downloaded Successfully");
        })
        .catch(() => {
          toast.error("Promoter Summary is Not Downloaded");
        });
    }
  };

  return (
    <Layout>
      <div className="mt-4 mb-6">
        <PageTitle title={"Prompter Summary"} />
      </div>
      <Card className="p-4">
        <h3 className="text-red-500 mb-5">Please fill all for View report.</h3>
        <form id="dowRecp" autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <Fields
                required={true}
                title="Notice Title"
                type="PromoterDropdown"
                autoComplete="Name"
                name="indicomp_promoter"
                value={downloadDonor.indicomp_promoter}
                onChange={(e) => onInputChange(e)}
                options={promoter}
              />
            </div>

            <div className="w-full">
              <Input
                type="date"
                label="From Date "
                className="required"
                required
                name="receipt_from_date"
                value={downloadDonor.receipt_from_date}
                onChange={(e) =>
                  onInputChange("receipt_from_date", e.target.value)
                }
              />
            </div>
            <div className="w-full">
              <Input
                type="date"
                label="To Date"
                required
                className="required"
                value={downloadDonor.receipt_to_date}
                onChange={(e) =>
                  onInputChange("receipt_to_date", e.target.value)
                }
                name="receipt_to_date"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4  py-4">
            <div className="w-full">
              <Button
                color="blue"
                fullWidth
                onClick={onSubmit}
                disabled={!isButtonEnabled}
              >
                Download
              </Button>
            </div>
            <div className="w-full">
              <Button
                color="blue"
                fullWidth
                onClick={onReportView}
                disabled={!isButtonEnabled}
              >
                View
              </Button>
            </div>{" "}
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default PromterSummary;
