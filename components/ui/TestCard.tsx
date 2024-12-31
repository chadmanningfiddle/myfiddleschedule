import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';

const TestCard = () => {
  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a test card to verify the card components are working.</p>
        </CardContent>
        <CardFooter>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Test Button
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestCard;