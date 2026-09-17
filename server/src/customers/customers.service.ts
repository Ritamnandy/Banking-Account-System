import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { decrypt, encrypt, maskAadhaar, maskPan, maskPhoneNumber } from './constants.js';
import { CustomerRepository } from './repository/customer.repository.js';
import  { UserStatus } from '../../generated/prisma/enums.js';


@Injectable()
export class CustomersService
{
  private readonly logger = new Logger( CustomersService.name );
  constructor ( private readonly customerRepository: CustomerRepository ) { }

  private encryptedData ( phoneNo: string, panNo: string, aadhaarNo: string )
  {
    return {
      phoneNo: encrypt( phoneNo ),
      panNo: encrypt( panNo ),
      aadhaarNo: encrypt( aadhaarNo )
    };
  }

  private decryptedData ( phoneNo: string, panNo: string, aadhaarNo: string )
  {
    return {
      phoneNo: decrypt( phoneNo ),
      panNo: decrypt( panNo ),
      aadhaarNo: decrypt( aadhaarNo )
    };
  }
  private maskedData ( phoneNo: string, panNo: string, aadhaarNo: string )
  {
    return {
      phoneNo: maskPhoneNumber( phoneNo ),
      panNo: maskPan( panNo ),
      aadhaarNo: maskAadhaar( aadhaarNo )
    };
  }


  async create ( createCustomerDto: CreateCustomerDto )
  {
    const data = this.encryptedData( createCustomerDto.phoneNo, createCustomerDto.panNo, createCustomerDto.aadhaarNo );


    const response = await this.customerRepository.createCustomer( {
      ...createCustomerDto,
      panNo: data.panNo,
      aadhaarNo: data.aadhaarNo,
      phoneNo: data.phoneNo
    } );
    if ( !response )
    {
      this.logger.error( 'Customer creation failed' );
      throw new NotFoundException( 'Customer creation failed' );
    }


    this.logger.log( `customer created Successfully ${ response.email },${ response.name }` );
    return {
      ...response,
      ...this.maskedData( response.phoneNo, response.panNo, response.aadhaarNo )
    };
  }

  async findAll ()
  {
    const response = await this.customerRepository.findAllCustomer()

    if ( response.length === 0 || !response )
    {
      throw new NotFoundException( 'No customers found' );
    }
    const decryptedData = response.map( ( customer ) => ( {
      ...customer,
      ...this.decryptedData( customer.phoneNo, customer.panNo, customer.aadhaarNo )
    } ) );


    return decryptedData.map( ( customer ) => ( {
      ...customer,
      ...this.maskedData( customer.phoneNo, customer.panNo, customer.aadhaarNo )
    } ) );
  }

  async findOne ( id: string )
  {
    const response = await this.customerRepository.findCustomerById( id );

    if ( !response )
    {
      throw new NotFoundException( `Customer with ID ${ id } not found` );
    }
    const decryptedData = this.decryptedData( response.phoneNo, response.panNo, response.aadhaarNo );
    return {
      ...response,
      ...this.maskedData( decryptedData.phoneNo, decryptedData.panNo, decryptedData.aadhaarNo )
    };
  }

  async update ( id: string, updateCustomerDto: UpdateCustomerDto )
  {
    const response = await this.customerRepository.updateCustomer( id, updateCustomerDto );

    if ( !response )
    {
      this.logger.error( `Customer with ID ${ id } not found or update failed.` );
      throw new NotFoundException( `Customer with ID ${ id } not found or update failed , please try again` );
    }

    const decryptedData = this.decryptedData( response.phoneNo, response.panNo, response.aadhaarNo );
    this.logger.log( `Customer with ID ${ id } updated successfully` );
    return {
      ...response,
      ...this.maskedData( decryptedData.phoneNo, decryptedData.panNo, decryptedData.aadhaarNo )
    };
  }

  async remove ( id: string )
  {
    const response = await this.customerRepository.deleteCustomer( id );

    if ( !response )
    {
      this.logger.error( `Customer with ID ${ id } not found or delete failed.` );
      throw new NotFoundException( `Customer with ID ${ id } not found or delete failed , please try again` );
    }

    this.logger.log( `Customer with ID ${ id } deleted successfully` );
    return {
      message: 'Customer deleted successfully.'
    };
  }

  async findCustomerByStatus ( status: UserStatus )
  {
    const response = await this.customerRepository.findCustomerByStatus( status )
    if ( !response )
    {
      this.logger.error( `No customers found with status ${ status }` );
      throw new NotFoundException( `No customers found with status ${ status }` );
    }
    const decryptedData = response.map( ( customer ) => ( {
      ...customer,
      ...this.decryptedData( customer.phoneNo, customer.panNo, customer.aadhaarNo )
    } ) );
    this.logger.log( `Customers with status ${ status } found successfully` );
    return {
      message: `Customers with status ${ status } found successfully`,
      customers: decryptedData.map( ( customer ) => ( {
        ...customer,
        ...this.maskedData( customer.phoneNo, customer.panNo, customer.aadhaarNo )
      } ) )
    };
  }


  async setCustomerStatus ( id: string, status: UserStatus )
  {
    const response = await this.customerRepository.updateCustomerStatus( id, status );

    if ( !response )
    {
      this.logger.error( `Customer with ID ${ id } not found or status update failed .` );
      throw new NotFoundException( `Customer with ID ${ id } not found or status update failed,Please try again` );
    }

    this.logger.log( `Customer with ID ${ id } status updated successfully` );
    return {
      message: 'Customer status updated successfully.'
    };
  }


  async inActiveCustomer ( id: string )
  {
    const response = await this.customerRepository.inActiveCustomer( id );

    if ( !response )
    {
      this.logger.error( `Customer with ID ${ id } not found or update failed , please try again` );
      throw new NotFoundException( `Customer with ID ${ id } not found or update failed , please try again` );
    }
    this.logger.log( `Customer with ID ${ id } inActice successfully` );
    return {
      message: 'Customer inActice  successfully.'
    };
  }

}
