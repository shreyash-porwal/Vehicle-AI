import { serializedCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


/**
 * Get car details by ID
 */
export async function getCarById(carId) {
    try {
      // Get current user if authenticated
      const { userId } = await auth();
      let dbUser = null;
  
      if (userId) {
        dbUser = await db.user.findUnique({
          where: { clerkUserId: userId },
        });
      }
  
      // Get car details
      const car = await db.car.findUnique({
        where: { id: carId },
      });
  
      if (!car) {
        return {
          success: false,
          error: "Car not found",
        };
      }
  
      // Check if car is wishlisted by user
      let isWishlisted = false;
      if (dbUser) {
        const savedCar = await db.userSavedCar.findUnique({
          where: {
            userId_carId: {
              userId: dbUser.id,
              carId,
            },
          },
        });
  
        isWishlisted = !!savedCar;
      }
  
      // Check if user has already booked a test drive for this car
      const existingTestDrive = await db.testDriveBooking.findFirst({
        where: {
          carId,
          userId: dbUser.id,
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      let userTestDrive = null;
  
      if (existingTestDrive) {
        userTestDrive = {
          id: existingTestDrive.id,
          status: existingTestDrive.status,
          bookingDate: existingTestDrive.bookingDate.toISOString(),
        };
      }
  
      // Get dealership info for test drive availability
      const dealership = await db.dealershipInfo.findFirst({
        include: {
          workingHours: true,
        },
      });
  
      return {
        success: true,
        data: {
          ...serializedCarData(car, isWishlisted),
          testDriveInfo: {
            userTestDrive,
            dealership: dealership
              ? {
                  ...dealership,
                  createdAt: dealership.createdAt.toISOString(),
                  updatedAt: dealership.updatedAt.toISOString(),
                  workingHours: dealership.workingHours.map((hour) => ({
                    ...hour,
                    createdAt: hour.createdAt.toISOString(),
                    updatedAt: hour.updatedAt.toISOString(),
                  })),
                }
              : null,
          },
        },
      };
    } catch (error) {
      throw new Error("Error fetching car details:" + error.message);
    }
  }