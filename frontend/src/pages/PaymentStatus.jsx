// import React, { useEffect, useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { phonepeService } from '../services/api.js'

// export default function PaymentStatus() {
//   const { id } = useParams() // route will be /payment-status/:id
//   const [status, setStatus] = useState(null)
//   const [amount, setAmount] = useState(null)
//   const [completedAt, setCompletedAt] = useState(null)
//   const [showDetails, setShowDetails] = useState(false)
//   const navigate = useNavigate()
//   // read query params for navigation back to specific group
//   const qp = new URLSearchParams(window.location.search)
//   const groupId = qp.get('groupId')

//   useEffect(() => {
//     if (!id) return
//     ;(async () => {
//       try {
//         const resp = await phonepeService.getStatus(id)
//         if (resp.data?.success) {
//           setStatus(resp.data.status)
//           setAmount(resp.data.amount)
//           setCompletedAt(resp.data.completedAt || resp.data.createdAt)
//         } else {
//           setStatus('UNKNOWN')
//         }
//       } catch (err) {
//         console.error('Status fetch error', err?.response?.data || err.message)
//         setStatus('ERROR')
//       }
//     })()
//   }, [id])

//   if (!status) return <div className="p-4">Loading...</div>

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold mb-4">Payment Result</h2>
//       <p className="mb-2"><strong>Transaction ID:</strong> {id}</p>
//       <p className="mb-2"><strong>Status:</strong> {status}</p>
//       <p className="mb-4"><strong>Amount:</strong> {amount}</p>
//       <div className="mb-4">
//         <button
//           className="px-4 py-2 border rounded mr-2"
//           onClick={() => setShowDetails((s) => !s)}
//         >
//           {showDetails ? 'Hide Details' : 'Show Details'}
//         </button>
//         <button
//           className="px-4 py-2 border rounded"
//           onClick={() => {
//             // force reload group page so data reflects new payment status
//             if (groupId) {
//               window.location.href = `/groups/${groupId}`
//             } else {
//               window.location.href = '/groups'
//             }
//           }}
//         >
//           Back to Group
//         </button>
//       </div>

//       {showDetails && (
//         <div className="p-3 border rounded bg-gray-50">
//           <p className="mb-1"><strong>Transaction ID:</strong> {id}</p>
//           <p className="mb-1"><strong>Status:</strong> {status}</p>
//           <p className="mb-1"><strong>Amount:</strong> {amount}</p>
//           <p className="mb-1"><strong>Date:</strong> {completedAt ? new Date(completedAt).toLocaleString() : 'N/A'}</p>
//         </div>
//       )}
//     </div>
//   )
// }






import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phonepeService, paymentService } from "../services/api.js";

export default function PaymentStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("CHECKING");
  const [amount, setAmount] = useState(0);
  const [completedAt, setCompletedAt] = useState(null);
  const [autoVerifyComplete, setAutoVerifyComplete] = useState(false);
  
  // Get query params
  const qp = new URLSearchParams(window.location.search);
  const groupId = qp.get('groupId');
  const cycleId = qp.get('cycleId');

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        console.log("Fetching payment status for:", id);
        const resp = await phonepeService.getStatus(id);
        
        if (resp.data?.success) {
          setStatus(resp.data.status);
          setAmount(resp.data.amount);
          setCompletedAt(resp.data.completedAt);

          // Auto verify if success and we have cycleId
          if (resp.data.status === "SUCCESS" && cycleId && !autoVerifyComplete) {
            console.log("Auto-verifying payment...");
            try {
              const verifyResp = await paymentService.autoVerify({
                transactionId: id,
                cycleId: cycleId,
                amount: resp.data.amount,
              });
              console.log("Auto-verify successful:", verifyResp.data);
              setAutoVerifyComplete(true);
              
              // Auto redirect to group after 2 seconds
              setTimeout(() => {
                if (groupId) {
                  navigate(`/groups/${groupId}`);
                } else {
                  navigate('/groups');
                }
              }, 2000);
            } catch (verifyErr) {
              console.error("Auto-verify failed:", verifyErr);
            }
          }
        } else {
          setStatus("UNKNOWN");
        }
      } catch (err) {
        console.error("Status fetch error:", err?.response?.data || err.message);
        setStatus("ERROR");
      }
    })();
  }, [id, cycleId, groupId, autoVerifyComplete, navigate]);

  const handleBackToGroup = () => {
    console.log("DEBUG → Redirecting back to specific group:", groupId);
    if (groupId) {
      navigate(`/groups/${groupId}`);
    } else {
      navigate("/groups");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Payment Status</h2>

      {status === "CHECKING" && <p>Checking payment status...</p>}

      {status === "SUCCESS" && (
        <>
          <p style={{ color: "green", fontWeight: "bold" }}>
            ✅ Payment Successful!
          </p>
          <p>Amount: ₹{amount}</p>
          <p>Transaction ID: {id}</p>
          {completedAt && <p>Completed at: {new Date(completedAt).toLocaleString()}</p>}
          {autoVerifyComplete && (
            <p style={{ color: "green", fontSize: "14px", marginTop: "10px" }}>
              ✅ Payment verified automatically. Redirecting to group...
            </p>
          )}
        </>
      )}

      {status === "FAILED" && (
        <p style={{ color: "red", fontWeight: "bold" }}>❌ Payment Failed!</p>
      )}

      {status === "UNKNOWN" && (
        <p style={{ color: "orange", fontWeight: "bold" }}>
          ⚠️ Unknown payment status
        </p>
      )}

      {status === "ERROR" && (
        <p style={{ color: "red" }}>⚠️ Error fetching payment status</p>
      )}

      <button onClick={handleBackToGroup} style={styles.button}>
        Go Back to Group
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "480px",
    margin: "60px auto",
    padding: "30px",
    textAlign: "center",
    borderRadius: "12px",
    background: "#f9f9f9",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "20px",
  },
  button: {
    marginTop: "25px",
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};


