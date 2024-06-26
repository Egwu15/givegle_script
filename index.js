import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import { getFirestore, where } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const successfulTransactionId = [
  "OOaNMGLciGRMsigjNlGFa3EmYDg2_1719323509377657",
];

async function getDocuments() {
  const pendingDonationsCollection = collection(db, "pendingDonations");
  const successfulDonationsCollection = collection(db, "successfulDonation");

  for (let i = 0; i < successfulTransactionId.length; i++) {
    const checkIfInSuccessfulTransaction = query(
      pendingDonationsCollection,
      where("tx_ref", "==", successfulTransactionId[i])
    );

    const snap = onSnapshot(checkIfInSuccessfulTransaction, (snapshot) => {
      snapshot.forEach((element) => {
        addSuccessfulPayment(element.data());
      });
    });
  }
  async function addSuccessfulPayment(donationData) {
    const snap = await getDocs(
      query(
        successfulDonationsCollection,
        where("tx_ref", "==", donationData.tx_ref)
      )
    );
    if (snap.empty) {
      const donation = await setDoc(
        doc(successfulDonationsCollection),
        donationData
      );
      console.log("donation added as successful", donationData);
    } else {
      console.log("donation already added", donationData);
    }
  }

  //   const snapshot = await getDocs(pendingDonationsCollection);
  //   let counter = 0;
  //   snapshot.forEach((doc) => {
  //     if (successfulTransactionId.includes(doc.id)) {
  //       console.log(doc.id, " => ", doc.data());
  //     }
  //     console.log("checked:", counter++);
  //   });
}

await getDocuments();
