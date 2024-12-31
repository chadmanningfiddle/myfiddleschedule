import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Calendar, Clock, DollarSign, Mail, Phone, User, X } from 'lucide-react';
import { format } from 'date-fns';

type BookingFormProps = {
  selectedDate: Date;
  selectedTime: string;
  lessonType: string;
  price: number;
  isZoomClass?: string;
  onClose: () => void;
  onSubmit: (bookingData: BookingData) => void;
};

export type BookingData = {
  name: string;
  email: string;
  phone: string;
  paymentMethod: 'Venmo' | 'Zelle';
  notes: string;
};

const BookingForm: React.FC<BookingFormProps> = ({
  selectedDate,
  selectedTime,
  lessonType,
  price,
  isZoomClass,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'Venmo',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-blue-900">Book Your Lesson</CardTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Lesson Details */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>{selectedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>${price}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{lessonType}</span>
                {isZoomClass && <span className="text-blue-600">- {isZoomClass}</span>}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                Your Name
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Phone Number
              </label>
              <input
                type="tel"
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-4 border rounded-lg ${
                    formData.paymentMethod === 'Venmo'
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Venmo' })}
                >
                  <span className="font-medium">Venmo</span>
                  <p className="text-sm text-gray-600">@Chad-manning-18</p>
                </button>
                <button
                  type="button"
                  className={`p-4 border rounded-lg ${
                    formData.paymentMethod === 'Zelle'
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Zelle' })}
                >
                  <span className="font-medium">Zelle</span>
                  <p className="text-sm text-gray-600">chadmanning@gmail.com</p>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-lg font-medium text-gray-700 mb-2">
                Special Notes or Requests
              </label>
              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors"
            >
              Confirm Booking
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;