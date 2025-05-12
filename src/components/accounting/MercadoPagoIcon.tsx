
import React from "react";

const MercadoPagoIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 6.982h3.154v10.037H0V6.982z" fill="#009EE3"/>
      <path d="M12.154 6.982h3.154v10.037h-3.154V6.982z" fill="#009EE3"/>
      <path d="M17.654 6.982h3.154v10.037h-3.154V6.982z" fill="#009EE3"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M3.154 6.982h4.5c2.307 0 3.5 1.194 3.5 3.244v6.793h-3.26V10.73c0-.614-.392-.824-.95-.824h-3.79V6.982z" fill="#009EE3"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M22.11 12.113c-.02-3.334-2.062-5.424-5.382-5.424H11v2.924h3.633c1.356 0 2.268.745 2.268 2.021v5.385h3.174v-3.143c1.343-.604 2.004-1.321 2.036-1.763z" fill="#009EE3"/>
    </svg>
  );
};

export default MercadoPagoIcon;
