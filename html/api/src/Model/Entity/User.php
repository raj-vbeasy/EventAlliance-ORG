<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * User Entity
 *
 * @property int $id
 * @property string $email
 * @property string $login_password
 * @property string $first_name
 * @property string $last_name
 * @property int $company_id
 * @property string $phone
 * @property string $address
 * @property string $city
 * @property string $zipcode
 * @property string $avatar
 *
 * @property \App\Model\Entity\Company $company
 */
class User extends Entity
{

    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        'email' => true,
        'login_password' => true,
        'first_name' => true,
        'last_name' => true,
        'company_id' => true,
        'phone' => true,
        'address' => true,
        'city' => true,
        'zipcode' => true,
        'avatar' => true,
        'company' => true
    ];
}
