import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const MyDocumentComponent = ({ filteredUsersForPDF, handleExportToPDF }) => {
  const componentRef = useRef();

  useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'HOA DON THUE XE',
    onAfterPrint: () => alert('Thanh Cong!'),
  });
  return (
    <div ref={componentRef}>
      {filteredUsersForPDF.map((user, index) => (
        <div key={index}>
          <p>{user.fullName}</p>
          {/* Render các thông tin khác của user */}
        </div>
      ))}
    </div>
  );
};

export default MyDocumentComponent;
