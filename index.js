import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import { getFirestore, where } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig, { debug: true });
const db = getFirestore(app);

const successfulTransactionId = [
  "qVph6eSfvxUrijbMjrgI5kziKo23_1727648737494201",
];

async function getDocuments() {
  const pendingDonationsCollection = collection(db, "pendingDonations");
  const successfulDonationsCollection = collection(db, "successfulDonation");

  for (let i = 0; i < successfulTransactionId.length; i++) {
    try {
      const checkIfInSuccessfulTransaction = query(
        pendingDonationsCollection,
        where("tx_ref", "==", successfulTransactionId[i])
      );

      await onSnapshot(checkIfInSuccessfulTransaction, async (snapshot) => {
        await processSnapshots(snapshot);
      });
    } catch (error) {
      console.log("error", error);
    }
  }
  async function addPaymentToUser(donationData) {
    let snap;
    try {
      const userDonationCollection = collection(
        db,
        `users/${donationData.donor_uid}/donations`
      );

      snap = await getDocs(
        query(
          userDonationCollection,
          where("tx_ref", "==", donationData.tx_ref)
        )
      );

      if (snap.empty) {
        await setDoc(doc(userDonationCollection, donationData.tx_ref), donationData);
        console.log("donation added to user as successful", donationData);
      } else {
        console.log("donation already added to user", donationData);
      }
    } catch (error) {
      console.log("error", error);
    }
  }
  async function addSuccessfulPayment(donationData) {
    let snap;
    try {
      console.log("donationData", donationData);
      snap = await getDocs(
        query(
          successfulDonationsCollection,
          where("tx_ref", "==", donationData.tx_ref)
        )
      );
    } catch (error) {
      console.log("error", error);
    }
    if (snap.empty) {
      await setDoc(doc(successfulDonationsCollection), donationData);
      console.log("donation added as successful", donationData);
    } else {
      console.log("donation already added", donationData);
    }
  }

  async function processSnapshots(snapshots) {
    for (const element of snapshots.docs) {
      await addSuccessfulPayment(element.data());
      await addPaymentToUser(element.data());
    }
  }
}

getDocuments().catch(console.error);
